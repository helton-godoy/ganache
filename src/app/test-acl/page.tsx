"use client";

import { AclEditor } from "@/components/features/acl/AclEditor";

export default function TestAclPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">ACL Editor Test Page</h1>
      <AclEditor path="/test/path" />
    </div>
  );
}
