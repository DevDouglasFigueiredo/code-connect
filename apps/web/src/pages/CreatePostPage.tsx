import { useNavigate } from 'react-router-dom';
import { createPost, type PostInput } from '../services/posts';
import { PostForm } from '../components/organisms/PostForm';

export function CreatePostPage() {
  const navigate = useNavigate();
  async function submit(input: PostInput) {
    const post = await createPost(input);
    navigate(`/posts/${post.id}`, { replace: true });
  }
  return <PostForm onSubmit={submit} />;
}
