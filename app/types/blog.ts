export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author: {
    name: string;
    avatar: string;
  };
  image: string;
}

export interface BlogCategory {
  name: string;
  count: number;
}