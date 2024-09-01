import GitHub from "next-auth/providers/github";
import NextAuth, { DefaultSession, NextAuthConfig } from "next-auth";

import { TableStorageAdapter } from "@auth/azure-tables-adapter";
import { AzureNamedKeyCredential, TableClient } from "@azure/data-tables";

const credential = new AzureNamedKeyCredential(
  process.env.AZURE_STORAGE_ACCOUNT_NAME!,
  process.env.AZURE_STORAGE_ACCOUNT_KEY!
);

const authClient = new TableClient(
  process.env.AZURE_STORAGE_TABLES_ENDPOINT!,
  "user",
  credential
);

// Look at: https://authjs.dev/getting-started/typescript#module-augmentation
//   Explains how to add new user properties that might be needed.
declare module "next-auth" {
  interface Session extends DefaultSession {
    // You can add custom properties to your Session type here
  }
}

const authOptions: NextAuthConfig = {
  providers: [GitHub],
  adapter: TableStorageAdapter(authClient),
  debug: process.env.NODE_ENV !== "production" ? true : false,
} satisfies NextAuthConfig;

// const tableStorageAdapter = getTableStorageAdapter();
// if (tableStorageAdapter) authOptions.adapter = tableStorageAdapter;

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
