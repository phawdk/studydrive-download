// Types from the Studydrive webpage

export interface User {
  name?: string;
}

export interface Markings {
  height: number;
  page: number;
  page_height: number;
  page_width: number;
  width: number;
  xstart: number;
  ystart: number;
}

export interface PostDetails {
  id: string;
  markings?: Markings;
  content: string;
  user?: User;
  anonymousUser?: User;
}

export interface Comment {
  user?: User;
  anonymousUser?: User;
  content: string;
}

export interface Post {
  postDetails: PostDetails;
  comments: Array<Comment>;
  totalComments: number;
}

export interface Course {
  id: number;
  name: string;
  members: string;
}

export interface Document {
  id: number;
  slug: string;
  file_id: number;
  avg_star_score: number;
  course: Course;
  course_name: string;
  created_at: string;
  description: string;
  display_file_name: string;
  downloads: number;
  extension: string;
  extract: string;
  file_mimetype: string;
  file_name_shorten: string;
  file_preview: string;
  file_preview_available: null | boolean;
  file_preview_thumb_link: string;
  file_type_label: string;
  filename: string;
  has_ai_content: boolean;
  number_of_pages: number;
  professor_name: string;
  rating: number;
  ratings_count: number;
  self_made: boolean;
  time: string;
  university_name: string;
  user_data: User;
  user_followed: boolean;
  user_is_uploader: boolean;
  user_star_vote: number;
  user_upvoted: boolean;
}

export interface StoreState {
  document: {
    discussionComplete: boolean;
    discussionFeed: Post[];
    showDiscussion: boolean;
    discussionLoading: boolean;
    document: Document;
  };
}
