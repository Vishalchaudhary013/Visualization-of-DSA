import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ALGORITHMS } from "@shared/algorithms";
import { ALGORITHM_RUNNERS } from "../algorithms";
import {
  ARRAY_PRESETS,
  buildParams,
  generateGraphEdges,
  readParams,
} from "../utils/inputs";

export const DEFAULT_ALGORITHM = "bubble-sort";

function createDefaults() {
  const array = ARRAY_PRESETS.random.build(10);
  return {
    algorithm: DEFAULT_ALGORITHM,
    array,
    target: array[Math.floor(Math.random() * array.length)],
    vertices: 6,
    edges: generateGraphEdges(6),
    start: 0,
    directed: false,
  };
}

/**
 * Visualizer inputs, initialised from and mirrored to the URL so any setup can
 * be bookmarked or shared (e.g. /visualizer?algo=quick-sort&arr=5,2,8).
 */
export function useVisualizerState() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState(() => {
    const initial = readParams(searchParams, createDefaults());
    if (
      !ALGORITHMS[initial.algorithm] ||
      !ALGORITHM_RUNNERS[initial.algorithm]
    ) {
      initial.algorithm = DEFAULT_ALGORITHM;
    }
    return initial;
  });

  // Navigating to /visualizer?algo=... while already on the page
  const urlAlgorithm = searchParams.get("algo");
  useEffect(() => {
    if (
      urlAlgorithm &&
      urlAlgorithm !== state.algorithm &&
      ALGORITHM_RUNNERS[urlAlgorithm]
    ) {
      setState((current) => ({ ...current, algorithm: urlAlgorithm }));
    }
  }, [urlAlgorithm]); // only react to the URL, not to local state changes

  const kind = ALGORITHM_RUNNERS[state.algorithm].kind;

  useEffect(() => {
    setSearchParams(buildParams({ ...state, kind }), { replace: true });
  }, [state, kind, setSearchParams]);

  const update = (changes) =>
    setState((current) => ({ ...current, ...changes }));

  const { vertices, edges, start, directed } = state;
  const graph = useMemo(
    () => ({ vertices, edges, start, directed }),
    [vertices, edges, start, directed],
  );

  return {
    ...state,
    kind,
    graph,
    setAlgorithm: (algorithm) => update({ algorithm }),
    setArray: (array) => update({ array }),
    setTarget: (target) => update({ target }),
    setGraph: (graph) => update(graph),
  };
}
