import { api } from './apiClient';

// Core integrations wrapper
export const Core = {
  InvokeLLM: async (data) => {
    return api.request('/integrations/llm', {
      method: 'POST',
      body: data,
    });
  },
  SendEmail: async (data) => {
    return api.request('/integrations/email', {
      method: 'POST',
      body: data,
    });
  },
  UploadFile: async ({ file }) => {
    return api.uploadFile(file);
  },
  GenerateImage: async (data) => {
    return api.request('/integrations/generate-image', {
      method: 'POST',
      body: data,
    });
  },
  ExtractDataFromUploadedFile: async (data) => {
    return api.request('/integrations/extract-data', {
      method: 'POST',
      body: data,
    });
  },
  CreateFileSignedUrl: async (data) => {
    return api.request('/integrations/signed-url', {
      method: 'POST',
      body: data,
    });
  },
  UploadPrivateFile: async ({ file }) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('private', 'true');
    
    const response = await fetch(`${api.baseURL}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${api.token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    return response.json();
  },
};

export const InvokeLLM = Core.InvokeLLM;

export const SendEmail = Core.SendEmail;

export const UploadFile = Core.UploadFile;

export const GenerateImage = Core.GenerateImage;

export const ExtractDataFromUploadedFile = Core.ExtractDataFromUploadedFile;

export const CreateFileSignedUrl = Core.CreateFileSignedUrl;

export const UploadPrivateFile = Core.UploadPrivateFile;






