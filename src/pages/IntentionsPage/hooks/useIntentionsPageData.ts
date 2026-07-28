import { useMemo } from 'react';
import { useIntentionsStore } from '../../../features/intentions';
import {
  getFilteredIntentions,
  getIntentionSummary,
  type IntentionListOptions,
} from '../../../features/intentions/utils/intentionFilters';

export function useIntentionsPageData(options: IntentionListOptions) {
  const intentions = useIntentionsStore((state) => state.intentions);
  const visibleIntentions = useMemo(() => getFilteredIntentions(intentions, options), [intentions, options]);
  const summary = useMemo(() => getIntentionSummary(intentions), [intentions]);

  return {
    intentions,
    visibleIntentions,
    summary,
  };
}
