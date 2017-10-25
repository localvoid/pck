import { TChildren } from "osh";

export function isNotNull(...children: TChildren[]): TChildren {
  return ["((", children, ") !== null)"];
}

export function isNotEmpty(...children: TChildren[]): TChildren {
  return ["((", children, ").length > 0)"];
}

export function isNotEmptyString(...children: TChildren[]): TChildren {
  return [`((`, children, `) !== "")`];
}

export function isNotZero(...children: TChildren[]): TChildren {
  return ["((", children, ") !== 0)"];
}

export function isTrue(...children: TChildren[]): TChildren {
  return ["((", children, ") === true)"];
}
