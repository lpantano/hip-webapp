import { useState } from 'react';
import { toast } from 'sonner';
import { DOIService } from '@/services/DOIService';

export interface PublicationData {
  title?: string;
  journal?: string;
  year?: number;
  abstract?: string;
  url?: string;
}

export interface UsePublicationFetchOptions {
  onSuccess?: (data: PublicationData, index?: number) => void;
  onError?: (error: string, index?: number) => void;
}

/**
 * Reusable hook for fetching publication data from DOI/PubMed
 *
 * @param options - Configuration options
 * @param options.onSuccess - Callback when publication data is successfully fetched
 * @param options.onError - Callback when an error occurs
 *
 * @returns Object containing fetchPublicationData function and loading state
 *
 * @example
 * // With react-hook-form
 * const { fetchPublicationData, isLoading } = usePublicationFetch({
 *   onSuccess: (data) => {
 *     form.setValue('title', data.title || '');
 *     form.setValue('journal', data.journal || '');
 *   }
 * });
 *
 * @example
 * // With plain state
 * const { fetchPublicationData, isLoading } = usePublicationFetch({
 *   onSuccess: (data) => {
 *     setFormData(prev => ({
 *       ...prev,
 *       title: data.title || prev.title,
 *       journal: data.journal || prev.journal
 *     }));
 *   }
 * });
 */
export const usePublicationFetch = (options: UsePublicationFetchOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { onSuccess, onError } = options;

  const fetchPublicationData = async (doi: string, index?: number) => {
    if (!doi || !doi.trim()) {
      const errorMsg = 'Please enter a DOI or PubMed link first';
      onError?.(errorMsg, index);
      return null;
    }

    setIsLoading(true);

    try {
      const pubData = await DOIService.fetchPublicationData(doi.trim());

      if (pubData) {
        toast.success('Publication Data Retrieved', {
          description: `Successfully fetched details for: ${pubData.title?.substring(0, 50)}...`,
        });
        onSuccess?.(pubData, index);
        return pubData;
      } else {
        const errorMsg = 'Could not retrieve publication data. Please enter details manually.';
        toast.error('Publication Fetch Error', {
          description: errorMsg,
        });
        onError?.(errorMsg, index);
        return null;
      }
    } catch (error) {
      console.error('Error fetching publication data:', error);
      const errorMsg = 'Failed to fetch publication data. Please enter details manually.';
      toast.error('Publication Fetch Error', {
        description: errorMsg,
      });
      onError?.(errorMsg, index);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { fetchPublicationData, isLoading };
};
