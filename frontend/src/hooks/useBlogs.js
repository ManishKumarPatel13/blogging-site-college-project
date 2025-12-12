import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { blogAPI } from '../lib/api';
import toast from 'react-hot-toast';

export const useBlogs = (params = {}) => {
  return useQuery({
    queryKey: ['blogs', params],
    queryFn: () => blogAPI.getAll(params).then(res => res.data),
  });
};

export const useRecentBlogs = (limit = 5) => {
  return useQuery({
    queryKey: ['blogs', 'recent', limit],
    queryFn: () => blogAPI.getRecent(limit).then(res => res.data?.blogs || res.data || []),
    staleTime: 60000, // 1 minute
    retry: 1,
  });
};

export const useBlog = (id) => {
  return useQuery({
    queryKey: ['blog', id],
    queryFn: () => blogAPI.getOne(id).then(res => res.data),
    enabled: !!id,
  });
};

export const useMyBlogs = (params = {}) => {
  return useQuery({
    queryKey: ['blogs', 'my', params],
    queryFn: () => blogAPI.getMyBlogs(params).then(res => res.data),
  });
};

export const useUserBlogs = (userId, params = {}) => {
  return useQuery({
    queryKey: ['blogs', 'user', userId, params],
    queryFn: () => blogAPI.getUserBlogs(userId, params).then(res => res.data),
    enabled: !!userId,
  });
};

export const useCreateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => blogAPI.create(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Blog post created successfully!');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create blog post';
      toast.error(message);
    },
  });
};

export const useUpdateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => blogAPI.update(id, data).then(res => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blog', variables.id] });
      toast.success('Blog post updated successfully!');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update blog post';
      toast.error(message);
    },
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => blogAPI.delete(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast.success('Blog post deleted successfully!');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to delete blog post';
      toast.error(message);
    },
  });
};
