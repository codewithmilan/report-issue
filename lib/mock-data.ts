export interface CivicIssue {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  location_address: string;
  created_at: string;
  updated_at?: string;
  image_url?: string;
  category_id?: string;
  reporter_id?: string;
  issue_categories?: {
    name: string;
    color: string;
  };
  profiles?: {
    full_name: string;
  };
}

export const sampleIssues: CivicIssue[] = [
  {
    id: "issue-sample-1",
    title: "Deep Pothole on Main Street Intersection",
    description: "Hazardous 6-inch deep pothole expanding near pedestrian crosswalk. Vehicles are swerving to avoid tire damage during peak morning rush.",
    status: "open",
    priority: "high",
    location_address: "Main St & 5th Avenue, Downtown",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    issue_categories: { name: "Road & Transportation", color: "#EF4444" },
    profiles: { full_name: "Sarah Jenkins" },
    image_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "issue-sample-2",
    title: "Broken Streetlight at Central Park Entrance",
    description: "The primary high-mast lamp post has been completely unpowered for 4 nights, causing severe pedestrian safety risks and dark sidewalks.",
    status: "in_progress",
    priority: "urgent",
    location_address: "Central Park West Gate & Pine Rd",
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    issue_categories: { name: "Public Safety", color: "#F59E0B" },
    profiles: { full_name: "David Miller" },
    image_url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "issue-sample-3",
    title: "Water Main Leak Flooding Sidewalk",
    description: "Pressurized municipal clean water line leak bubbling up from pavement cracks, resulting in water loss and slippery conditions.",
    status: "resolved",
    priority: "medium",
    location_address: "420 Elm Street, North District",
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    issue_categories: { name: "Water & Utilities", color: "#3B82F6" },
    profiles: { full_name: "Elena Rostova" },
    image_url: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "issue-sample-4",
    title: "Overflowing Public Recycling Dumpsters",
    description: "Collection was missed over the holiday weekend; bins are overflowing onto sidewalk and lawn perimeter.",
    status: "open",
    priority: "medium",
    location_address: "Maplewood Community Center, Park Lane",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    issue_categories: { name: "Waste Management", color: "#8B5CF6" },
    profiles: { full_name: "Marcus Vance" },
    image_url: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=60",
  },
];
