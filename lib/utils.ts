import { type ClassValue, clsx } from "clsx"
import { produce } from "immer";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function mapArrayToEntities<
  T extends Object[],
  K extends string | number | symbol
>(array: T, getId: (element: T[number]) => K) {
  const ids = array.map(getId);
  const record = array.reduce<Record<K, T[number]>>((record, element) => {
    record[getId(element)] = element;
    return record;
  }, {} as Record<K, T[number]>);

  return {
    ids,
    record,
    toArray: () => ids.map((id) => record[id]),
  };
}
