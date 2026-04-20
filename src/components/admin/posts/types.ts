export type Post = {
  id: string;
  title: string;
  date: string;
  image: string;
  soon: string;
  imagePublicId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type HeroSection = {
  id: string;
  title: string;
  backgroundImage: string;
  imagePublicId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PostFormState = {
  postId: string;
  title: string;
  date: string;
  soon: string;
  image: string;
  imagePublicId: string;
};

export type HeroFormState = {
  heroId: string;
  title: string;
  backgroundImage: string;
  imagePublicId: string;
};

export const initialPostForm: PostFormState = {
  postId: "",
  title: "",
  date: "",
  soon: "SOON",
  image: "",
  imagePublicId: "",
};

export const initialHeroForm: HeroFormState = {
  heroId: "",
  title: "",
  backgroundImage: "",
  imagePublicId: "",
};
