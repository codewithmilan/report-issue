-- Seed initial issue categories
INSERT INTO public.issue_categories (name, description, color) VALUES
('Road & Transportation', 'Potholes, traffic signals, road maintenance', '#EF4444'),
('Water & Utilities', 'Water leaks, sewer issues, utility problems', '#3B82F6'),
('Parks & Recreation', 'Park maintenance, playground issues, green spaces', '#10B981'),
('Public Safety', 'Street lighting, safety concerns, emergency issues', '#F59E0B'),
('Waste Management', 'Garbage collection, recycling, illegal dumping', '#8B5CF6'),
('Noise & Nuisance', 'Noise complaints, public disturbances', '#F97316'),
('Building & Zoning', 'Code violations, construction issues, permits', '#6B7280'),
('Other', 'Issues that don\'t fit other categories', '#64748B')
ON CONFLICT (name) DO NOTHING;
