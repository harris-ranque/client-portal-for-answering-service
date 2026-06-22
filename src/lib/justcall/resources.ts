import { justCallGetAllPages, justCallRequest } from "@/lib/justcall/client";
import type { JustCallCall, JustCallContact, JustCallUser } from "@/lib/justcall/types";

function getListItems<T>(response: { data?: T[] | T }) {
  if (Array.isArray(response.data)) {
    return response.data;
  }

  return [];
}

export async function listJustCallCalls(options?: {
  fromDatetime?: string;
  toDatetime?: string;
  justcallNumber?: string;
  maxPages?: number;
}) {
  return justCallGetAllPages<JustCallCall>("/v2.1/calls", {
    perPage: 100,
    maxPages: options?.maxPages ?? 20,
    query: {
      from_datetime: options?.fromDatetime,
      to_datetime: options?.toDatetime,
      justcall_number: options?.justcallNumber,
      sort: "id",
      order: "desc",
    },
    getItems: getListItems,
  });
}

export async function listJustCallUsers(options?: { maxPages?: number }) {
  return justCallGetAllPages<JustCallUser>("/v2.1/users", {
    perPage: 100,
    maxPages: options?.maxPages ?? 10,
    query: {
      order: "desc",
    },
    getItems: getListItems,
  });
}

export async function listJustCallContacts(options?: { maxPages?: number }) {
  return justCallGetAllPages<JustCallContact>("/v2.1/contacts", {
    perPage: 100,
    maxPages: options?.maxPages ?? 10,
    query: {
      sort: "id",
      order: "desc",
    },
    getItems: getListItems,
  });
}

export async function pingJustCallApi() {
  const response = await justCallRequest<JustCallUser[]>("/v2.1/users", {
    query: { page: 1, per_page: 1 },
  });

  return {
    ok: response.status === "success" || Array.isArray(response.data),
    status: response.status ?? "unknown",
  };
}
