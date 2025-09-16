-- Albums table
CREATE TABLE albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  unlock_date TIMESTAMP WITH TIME ZONE, -- NULL = 未開封, 値あり = 開封済み（24時間カウントダウン開始）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photos table
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  caption TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_albums_user_id ON albums(user_id);
CREATE INDEX idx_albums_unlock_date ON albums(unlock_date);
CREATE INDEX idx_photos_album_id ON photos(album_id);

-- Enable Row Level Security (RLS)
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for albums
CREATE POLICY "Users can view their own albums" ON albums
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own albums" ON albums
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own albums" ON albums
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own albums" ON albums
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for photos
CREATE POLICY "Users can view photos in their albums" ON photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM albums 
      WHERE albums.id = photos.album_id 
      AND albums.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert photos in their albums" ON photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM albums 
      WHERE albums.id = photos.album_id 
      AND albums.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update photos in their albums" ON photos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM albums 
      WHERE albums.id = photos.album_id 
      AND albums.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete photos in their albums" ON photos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM albums 
      WHERE albums.id = photos.album_id 
      AND albums.user_id = auth.uid()
    )
  );

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_albums_updated_at 
  BEFORE UPDATE ON albums 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for photos (if not exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('album-photos', 'album-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload their own photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'album-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'album-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'album-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );