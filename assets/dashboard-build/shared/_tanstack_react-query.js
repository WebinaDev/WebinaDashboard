var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));

// shared-entry-_tanstack_react-query.js
var shared_entry_tanstack_react_query_exports = {};
__export(shared_entry_tanstack_react_query_exports, {
  HydrationBoundary: () => HydrationBoundary,
  IsRestoringProvider: () => IsRestoringProvider,
  QueryClientContext: () => QueryClientContext,
  QueryClientProvider: () => QueryClientProvider,
  QueryErrorResetBoundary: () => QueryErrorResetBoundary,
  infiniteQueryOptions: () => infiniteQueryOptions,
  mutationOptions: () => mutationOptions,
  queryOptions: () => queryOptions,
  useInfiniteQuery: () => useInfiniteQuery,
  useIsFetching: () => useIsFetching,
  useIsMutating: () => useIsMutating,
  useIsRestoring: () => useIsRestoring,
  useMutation: () => useMutation,
  useMutationState: () => useMutationState,
  usePrefetchInfiniteQuery: () => usePrefetchInfiniteQuery,
  usePrefetchQuery: () => usePrefetchQuery,
  useQueries: () => useQueries,
  useQuery: () => useQuery,
  useQueryClient: () => useQueryClient,
  useQueryErrorResetBoundary: () => useQueryErrorResetBoundary,
  useSuspenseInfiniteQuery: () => useSuspenseInfiniteQuery,
  useSuspenseQueries: () => useSuspenseQueries,
  useSuspenseQuery: () => useSuspenseQuery
});
export * from "@tanstack/query-core";

// node_modules/@tanstack/react-query/build/modern/index.js
var modern_exports = {};
__export(modern_exports, {
  HydrationBoundary: () => HydrationBoundary,
  IsRestoringProvider: () => IsRestoringProvider,
  QueryClientContext: () => QueryClientContext,
  QueryClientProvider: () => QueryClientProvider,
  QueryErrorResetBoundary: () => QueryErrorResetBoundary,
  infiniteQueryOptions: () => infiniteQueryOptions,
  mutationOptions: () => mutationOptions,
  queryOptions: () => queryOptions,
  useInfiniteQuery: () => useInfiniteQuery,
  useIsFetching: () => useIsFetching,
  useIsMutating: () => useIsMutating,
  useIsRestoring: () => useIsRestoring,
  useMutation: () => useMutation,
  useMutationState: () => useMutationState,
  usePrefetchInfiniteQuery: () => usePrefetchInfiniteQuery,
  usePrefetchQuery: () => usePrefetchQuery,
  useQueries: () => useQueries,
  useQuery: () => useQuery,
  useQueryClient: () => useQueryClient,
  useQueryErrorResetBoundary: () => useQueryErrorResetBoundary,
  useSuspenseInfiniteQuery: () => useSuspenseInfiniteQuery,
  useSuspenseQueries: () => useSuspenseQueries,
  useSuspenseQuery: () => useSuspenseQuery
});
__reExport(modern_exports, query_core_star);
import * as query_core_star from "@tanstack/query-core";

// node_modules/@tanstack/react-query/build/modern/useQueries.js
import * as React5 from "react";
import {
  QueriesObserver,
  QueryObserver,
  noop,
  notifyManager
} from "@tanstack/query-core";

// node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js
import * as React from "react";
import { jsx } from "react/jsx-runtime";
var QueryClientContext = React.createContext(
  void 0
);
var useQueryClient = (queryClient) => {
  const client = React.useContext(QueryClientContext);
  if (queryClient) {
    return queryClient;
  }
  if (!client) {
    throw new Error("No QueryClient set, use QueryClientProvider to set one");
  }
  return client;
};
var QueryClientProvider = ({
  client,
  children
}) => {
  React.useEffect(() => {
    client.mount();
    return () => {
      client.unmount();
    };
  }, [client]);
  return /* @__PURE__ */ jsx(QueryClientContext.Provider, { value: client, children });
};

// node_modules/@tanstack/react-query/build/modern/IsRestoringProvider.js
import * as React2 from "react";
var IsRestoringContext = React2.createContext(false);
var useIsRestoring = () => React2.useContext(IsRestoringContext);
var IsRestoringProvider = IsRestoringContext.Provider;

// node_modules/@tanstack/react-query/build/modern/QueryErrorResetBoundary.js
import * as React3 from "react";
import { jsx as jsx2 } from "react/jsx-runtime";
function createValue() {
  let isReset = false;
  return {
    clearReset: () => {
      isReset = false;
    },
    reset: () => {
      isReset = true;
    },
    isReset: () => {
      return isReset;
    }
  };
}
var QueryErrorResetBoundaryContext = React3.createContext(createValue());
var useQueryErrorResetBoundary = () => React3.useContext(QueryErrorResetBoundaryContext);
var QueryErrorResetBoundary = ({
  children
}) => {
  const [value] = React3.useState(() => createValue());
  return /* @__PURE__ */ jsx2(QueryErrorResetBoundaryContext.Provider, { value, children: typeof children === "function" ? children(value) : children });
};

// node_modules/@tanstack/react-query/build/modern/errorBoundaryUtils.js
import * as React4 from "react";
import { shouldThrowError } from "@tanstack/query-core";
var ensurePreventErrorBoundaryRetry = (options, errorResetBoundary, query) => {
  const throwOnError = query?.state.error && typeof options.throwOnError === "function" ? shouldThrowError(options.throwOnError, [query.state.error, query]) : options.throwOnError;
  if (options.suspense || options.experimental_prefetchInRender || throwOnError) {
    if (!errorResetBoundary.isReset()) {
      options.retryOnMount = false;
    }
  }
};
var useClearResetErrorBoundary = (errorResetBoundary) => {
  React4.useEffect(() => {
    errorResetBoundary.clearReset();
  }, [errorResetBoundary]);
};
var getHasError = ({
  result,
  errorResetBoundary,
  throwOnError,
  query,
  suspense
}) => {
  return result.isError && !errorResetBoundary.isReset() && !result.isFetching && query && (suspense && result.data === void 0 || shouldThrowError(throwOnError, [result.error, query]));
};

// node_modules/@tanstack/react-query/build/modern/suspense.js
var defaultThrowOnError = (_error, query) => query.state.data === void 0;
var ensureSuspenseTimers = (defaultedOptions) => {
  if (defaultedOptions.suspense) {
    const MIN_SUSPENSE_TIME_MS = 1e3;
    const clamp = (value) => value === "static" ? value : Math.max(value ?? MIN_SUSPENSE_TIME_MS, MIN_SUSPENSE_TIME_MS);
    const originalStaleTime = defaultedOptions.staleTime;
    defaultedOptions.staleTime = typeof originalStaleTime === "function" ? (...args) => clamp(originalStaleTime(...args)) : clamp(originalStaleTime);
    if (typeof defaultedOptions.gcTime === "number") {
      defaultedOptions.gcTime = Math.max(
        defaultedOptions.gcTime,
        MIN_SUSPENSE_TIME_MS
      );
    }
  }
};
var willFetch = (result, isRestoring) => result.isLoading && result.isFetching && !isRestoring;
var shouldSuspend = (defaultedOptions, result) => defaultedOptions?.suspense && result.isPending;
var fetchOptimistic = (defaultedOptions, observer, errorResetBoundary) => observer.fetchOptimistic(defaultedOptions).catch(() => {
  errorResetBoundary.clearReset();
});

// node_modules/@tanstack/react-query/build/modern/useQueries.js
function useQueries({
  queries,
  ...options
}, queryClient) {
  const client = useQueryClient(queryClient);
  const isRestoring = useIsRestoring();
  const errorResetBoundary = useQueryErrorResetBoundary();
  const defaultedQueries = React5.useMemo(
    () => queries.map((opts) => {
      const defaultedOptions = client.defaultQueryOptions(
        opts
      );
      defaultedOptions._optimisticResults = isRestoring ? "isRestoring" : "optimistic";
      return defaultedOptions;
    }),
    [queries, client, isRestoring]
  );
  defaultedQueries.forEach((queryOptions2) => {
    ensureSuspenseTimers(queryOptions2);
    const query = client.getQueryCache().get(queryOptions2.queryHash);
    ensurePreventErrorBoundaryRetry(queryOptions2, errorResetBoundary, query);
  });
  useClearResetErrorBoundary(errorResetBoundary);
  const [observer] = React5.useState(
    () => new QueriesObserver(
      client,
      defaultedQueries,
      options
    )
  );
  const [optimisticResult, getCombinedResult, trackResult] = observer.getOptimisticResult(
    defaultedQueries,
    options.combine
  );
  const shouldSubscribe = !isRestoring && options.subscribed !== false;
  React5.useSyncExternalStore(
    React5.useCallback(
      (onStoreChange) => shouldSubscribe ? observer.subscribe(notifyManager.batchCalls(onStoreChange)) : noop,
      [observer, shouldSubscribe]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );
  React5.useEffect(() => {
    observer.setQueries(
      defaultedQueries,
      options
    );
  }, [defaultedQueries, options, observer]);
  const shouldAtLeastOneSuspend = optimisticResult.some(
    (result, index) => shouldSuspend(defaultedQueries[index], result)
  );
  const suspensePromises = shouldAtLeastOneSuspend ? optimisticResult.flatMap((result, index) => {
    const opts = defaultedQueries[index];
    if (opts && shouldSuspend(opts, result)) {
      const queryObserver = new QueryObserver(client, opts);
      return fetchOptimistic(opts, queryObserver, errorResetBoundary);
    }
    return [];
  }) : [];
  if (suspensePromises.length > 0) {
    throw Promise.all(suspensePromises);
  }
  const firstSingleResultWhichShouldThrow = optimisticResult.find(
    (result, index) => {
      const query = defaultedQueries[index];
      return query && getHasError({
        result,
        errorResetBoundary,
        throwOnError: query.throwOnError,
        query: client.getQueryCache().get(query.queryHash),
        suspense: query.suspense
      });
    }
  );
  if (firstSingleResultWhichShouldThrow?.error) {
    throw firstSingleResultWhichShouldThrow.error;
  }
  return getCombinedResult(trackResult());
}

// node_modules/@tanstack/react-query/build/modern/useQuery.js
import { QueryObserver as QueryObserver2 } from "@tanstack/query-core";

// node_modules/@tanstack/react-query/build/modern/useBaseQuery.js
import * as React6 from "react";
import { environmentManager, noop as noop2, notifyManager as notifyManager2 } from "@tanstack/query-core";
function useBaseQuery(options, Observer, queryClient) {
  if (false) {
    if (typeof options !== "object" || Array.isArray(options)) {
      throw new Error(
        'Bad argument type. Starting with v5, only the "Object" form is allowed when calling query related functions. Please use the error stack to find the culprit call. More info here: https://tanstack.com/query/latest/docs/react/guides/migrating-to-v5#supports-a-single-signature-one-object'
      );
    }
  }
  const isRestoring = useIsRestoring();
  const errorResetBoundary = useQueryErrorResetBoundary();
  const client = useQueryClient(queryClient);
  const defaultedOptions = client.defaultQueryOptions(options);
  client.getDefaultOptions().queries?._experimental_beforeQuery?.(
    defaultedOptions
  );
  const query = client.getQueryCache().get(defaultedOptions.queryHash);
  if (false) {
    if (!defaultedOptions.queryFn) {
      console.error(
        `[${defaultedOptions.queryHash}]: No queryFn was passed as an option, and no default queryFn was found. The queryFn parameter is only optional when using a default queryFn. More info here: https://tanstack.com/query/latest/docs/framework/react/guides/default-query-function`
      );
    }
  }
  defaultedOptions._optimisticResults = isRestoring ? "isRestoring" : "optimistic";
  ensureSuspenseTimers(defaultedOptions);
  ensurePreventErrorBoundaryRetry(defaultedOptions, errorResetBoundary, query);
  useClearResetErrorBoundary(errorResetBoundary);
  const isNewCacheEntry = !client.getQueryCache().get(defaultedOptions.queryHash);
  const [observer] = React6.useState(
    () => new Observer(
      client,
      defaultedOptions
    )
  );
  const result = observer.getOptimisticResult(defaultedOptions);
  const shouldSubscribe = !isRestoring && options.subscribed !== false;
  React6.useSyncExternalStore(
    React6.useCallback(
      (onStoreChange) => {
        const unsubscribe = shouldSubscribe ? observer.subscribe(notifyManager2.batchCalls(onStoreChange)) : noop2;
        observer.updateResult();
        return unsubscribe;
      },
      [observer, shouldSubscribe]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );
  React6.useEffect(() => {
    observer.setOptions(defaultedOptions);
  }, [defaultedOptions, observer]);
  if (shouldSuspend(defaultedOptions, result)) {
    throw fetchOptimistic(defaultedOptions, observer, errorResetBoundary);
  }
  if (getHasError({
    result,
    errorResetBoundary,
    throwOnError: defaultedOptions.throwOnError,
    query,
    suspense: defaultedOptions.suspense
  })) {
    throw result.error;
  }
  ;
  client.getDefaultOptions().queries?._experimental_afterQuery?.(
    defaultedOptions,
    result
  );
  if (defaultedOptions.experimental_prefetchInRender && !environmentManager.isServer() && willFetch(result, isRestoring)) {
    const promise = isNewCacheEntry ? (
      // Fetch immediately on render in order to ensure `.promise` is resolved even if the component is unmounted
      fetchOptimistic(defaultedOptions, observer, errorResetBoundary)
    ) : (
      // subscribe to the "cache promise" so that we can finalize the currentThenable once data comes in
      query?.promise
    );
    promise?.catch(noop2).finally(() => {
      observer.updateResult();
    });
  }
  return !defaultedOptions.notifyOnChangeProps ? observer.trackResult(result) : result;
}

// node_modules/@tanstack/react-query/build/modern/useQuery.js
function useQuery(options, queryClient) {
  return useBaseQuery(options, QueryObserver2, queryClient);
}

// node_modules/@tanstack/react-query/build/modern/useSuspenseQuery.js
import { QueryObserver as QueryObserver3, skipToken } from "@tanstack/query-core";
function useSuspenseQuery(options, queryClient) {
  if (false) {
    if (options.queryFn === skipToken) {
      console.error("skipToken is not allowed for useSuspenseQuery");
    }
  }
  return useBaseQuery(
    {
      ...options,
      enabled: true,
      suspense: true,
      throwOnError: defaultThrowOnError,
      placeholderData: void 0
    },
    QueryObserver3,
    queryClient
  );
}

// node_modules/@tanstack/react-query/build/modern/useSuspenseInfiniteQuery.js
import { InfiniteQueryObserver, skipToken as skipToken2 } from "@tanstack/query-core";
function useSuspenseInfiniteQuery(options, queryClient) {
  if (false) {
    if (options.queryFn === skipToken2) {
      console.error("skipToken is not allowed for useSuspenseInfiniteQuery");
    }
  }
  return useBaseQuery(
    {
      ...options,
      enabled: true,
      suspense: true,
      throwOnError: defaultThrowOnError
    },
    InfiniteQueryObserver,
    queryClient
  );
}

// node_modules/@tanstack/react-query/build/modern/useSuspenseQueries.js
import { skipToken as skipToken3 } from "@tanstack/query-core";
function useSuspenseQueries(options, queryClient) {
  return useQueries(
    {
      ...options,
      queries: options.queries.map((query) => {
        if (false) {
          if (query.queryFn === skipToken3) {
            console.error("skipToken is not allowed for useSuspenseQueries");
          }
        }
        return {
          ...query,
          suspense: true,
          throwOnError: defaultThrowOnError,
          enabled: true,
          placeholderData: void 0
        };
      })
    },
    queryClient
  );
}

// node_modules/@tanstack/react-query/build/modern/usePrefetchQuery.js
function usePrefetchQuery(options, queryClient) {
  const client = useQueryClient(queryClient);
  if (!client.getQueryState(options.queryKey)) {
    client.prefetchQuery(options);
  }
}

// node_modules/@tanstack/react-query/build/modern/usePrefetchInfiniteQuery.js
function usePrefetchInfiniteQuery(options, queryClient) {
  const client = useQueryClient(queryClient);
  if (!client.getQueryState(options.queryKey)) {
    client.prefetchInfiniteQuery(options);
  }
}

// node_modules/@tanstack/react-query/build/modern/queryOptions.js
function queryOptions(options) {
  return options;
}

// node_modules/@tanstack/react-query/build/modern/infiniteQueryOptions.js
function infiniteQueryOptions(options) {
  return options;
}

// node_modules/@tanstack/react-query/build/modern/HydrationBoundary.js
import * as React7 from "react";
import { hydrate } from "@tanstack/query-core";
var HydrationBoundary = ({
  children,
  options = {},
  state,
  queryClient
}) => {
  const client = useQueryClient(queryClient);
  const optionsRef = React7.useRef(options);
  React7.useEffect(() => {
    optionsRef.current = options;
  });
  const hydrationQueue = React7.useMemo(() => {
    if (state) {
      if (typeof state !== "object") {
        return;
      }
      const queryCache = client.getQueryCache();
      const queries = state.queries || [];
      const newQueries = [];
      const existingQueries = [];
      for (const dehydratedQuery of queries) {
        const existingQuery = queryCache.get(dehydratedQuery.queryHash);
        if (!existingQuery) {
          newQueries.push(dehydratedQuery);
        } else {
          const hydrationIsNewer = dehydratedQuery.state.dataUpdatedAt > existingQuery.state.dataUpdatedAt || dehydratedQuery.promise && existingQuery.state.status !== "pending" && existingQuery.state.fetchStatus !== "fetching" && dehydratedQuery.dehydratedAt !== void 0 && dehydratedQuery.dehydratedAt > existingQuery.state.dataUpdatedAt;
          if (hydrationIsNewer) {
            existingQueries.push(dehydratedQuery);
          }
        }
      }
      if (newQueries.length > 0) {
        hydrate(client, { queries: newQueries }, optionsRef.current);
      }
      if (existingQueries.length > 0) {
        return existingQueries;
      }
    }
    return void 0;
  }, [client, state]);
  React7.useEffect(() => {
    if (hydrationQueue) {
      hydrate(client, { queries: hydrationQueue }, optionsRef.current);
    }
  }, [client, hydrationQueue]);
  return children;
};

// node_modules/@tanstack/react-query/build/modern/useIsFetching.js
import * as React8 from "react";
import { notifyManager as notifyManager3 } from "@tanstack/query-core";
function useIsFetching(filters, queryClient) {
  const client = useQueryClient(queryClient);
  const queryCache = client.getQueryCache();
  return React8.useSyncExternalStore(
    React8.useCallback(
      (onStoreChange) => queryCache.subscribe(notifyManager3.batchCalls(onStoreChange)),
      [queryCache]
    ),
    () => client.isFetching(filters),
    () => client.isFetching(filters)
  );
}

// node_modules/@tanstack/react-query/build/modern/useMutationState.js
import * as React9 from "react";
import { notifyManager as notifyManager4, replaceEqualDeep } from "@tanstack/query-core";
function useIsMutating(filters, queryClient) {
  const client = useQueryClient(queryClient);
  return useMutationState(
    { filters: { ...filters, status: "pending" } },
    client
  ).length;
}
function getResult(mutationCache, options) {
  return mutationCache.findAll(options.filters).map(
    (mutation) => options.select ? options.select(mutation) : mutation.state
  );
}
function useMutationState(options = {}, queryClient) {
  const mutationCache = useQueryClient(queryClient).getMutationCache();
  const optionsRef = React9.useRef(options);
  const result = React9.useRef(null);
  if (result.current === null) {
    result.current = getResult(mutationCache, options);
  }
  React9.useEffect(() => {
    optionsRef.current = options;
  });
  return React9.useSyncExternalStore(
    React9.useCallback(
      (onStoreChange) => mutationCache.subscribe(() => {
        const nextResult = replaceEqualDeep(
          result.current,
          getResult(mutationCache, optionsRef.current)
        );
        if (result.current !== nextResult) {
          result.current = nextResult;
          notifyManager4.schedule(onStoreChange);
        }
      }),
      [mutationCache]
    ),
    () => result.current,
    () => result.current
  );
}

// node_modules/@tanstack/react-query/build/modern/useMutation.js
import * as React10 from "react";
import {
  MutationObserver,
  noop as noop3,
  notifyManager as notifyManager5,
  shouldThrowError as shouldThrowError2
} from "@tanstack/query-core";
function useMutation(options, queryClient) {
  const client = useQueryClient(queryClient);
  const [observer] = React10.useState(
    () => new MutationObserver(
      client,
      options
    )
  );
  React10.useEffect(() => {
    observer.setOptions(options);
  }, [observer, options]);
  const result = React10.useSyncExternalStore(
    React10.useCallback(
      (onStoreChange) => observer.subscribe(notifyManager5.batchCalls(onStoreChange)),
      [observer]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );
  const mutate = React10.useCallback(
    (variables, mutateOptions) => {
      observer.mutate(variables, mutateOptions).catch(noop3);
    },
    [observer]
  );
  if (result.error && shouldThrowError2(observer.options.throwOnError, [result.error])) {
    throw result.error;
  }
  return { ...result, mutate, mutateAsync: result.mutate };
}

// node_modules/@tanstack/react-query/build/modern/mutationOptions.js
function mutationOptions(options) {
  return options;
}

// node_modules/@tanstack/react-query/build/modern/useInfiniteQuery.js
import { InfiniteQueryObserver as InfiniteQueryObserver2 } from "@tanstack/query-core";
function useInfiniteQuery(options, queryClient) {
  return useBaseQuery(
    options,
    InfiniteQueryObserver2,
    queryClient
  );
}

// shared-entry-_tanstack_react-query.js
__reExport(shared_entry_tanstack_react_query_exports, modern_exports);
export {
  HydrationBoundary,
  IsRestoringProvider,
  QueryClientContext,
  QueryClientProvider,
  QueryErrorResetBoundary,
  infiniteQueryOptions,
  mutationOptions,
  queryOptions,
  useInfiniteQuery,
  useIsFetching,
  useIsMutating,
  useIsRestoring,
  useMutation,
  useMutationState,
  usePrefetchInfiniteQuery,
  usePrefetchQuery,
  useQueries,
  useQuery,
  useQueryClient,
  useQueryErrorResetBoundary,
  useSuspenseInfiniteQuery,
  useSuspenseQueries,
  useSuspenseQuery
};
