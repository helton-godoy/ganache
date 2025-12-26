import { useGetAcl, useSetAcl } from "@/api/generated/default/default";
import {
  AceInheritFlags,
  AcePrincipal,
  AceType,
  Nfs4Ace,
  Nfs4Acl,
  Nfs4Permissions,
  SetAclRequest,
} from "@/api/generated/model";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Plus, Save, Trash2, User, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner"; // Assuming sonner is used for toasts
import { AclRecursiveDialog } from "./AclRecursiveDialog";

interface AclEditorProps {
  path: string;
}

const DEFAULT_PERMISSIONS: Nfs4Permissions = {
  read_data: true,
  write_data: false,
  append_data: false,
  execute: true,
  delete: false,
  delete_child: false,
  read_acl: false,
  write_acl: false,
  read_attributes: true,
  write_attributes: false,
  read_named_attrs: true,
  write_named_attrs: false,
  write_owner: false,
  synchronize: false,
};

const DEFAULT_INHERIT_FLAGS: AceInheritFlags = {
  file_inherit: true,
  dir_inherit: true,
  inherit_only: false,
  no_propagate: false,
  successful_access: false,
  failed_access: false,
  inherited: false,
};

export function AclEditor({ path }: AclEditorProps) {
  const { data: aclResponse, isLoading, refetch } = useGetAcl(path);
  const { mutateAsync: setAcl, isPending: isSaving } = useSetAcl();

  const [aces, setAces] = useState<Nfs4Ace[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [recursive, setRecursive] = useState(false);
  const [recursiveDialogOpen, setRecursiveDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentAce, setCurrentAce] = useState<Nfs4Ace | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Load initial data
  useEffect(() => {
    if (aclResponse?.data?.acl?.aces) {
      setAces(aclResponse.data.acl.aces);
      setIsDirty(false);
    }
  }, [aclResponse]);

  const handleSave = async () => {
    if (recursive) {
      setRecursiveDialogOpen(true);
    } else {
      await performSave(false);
    }
  };

  const performSave = async (isRecursive: boolean) => {
    try {
      const acl: Nfs4Acl = {
        path,
        aces,
      };

      const request: SetAclRequest = {
        path,
        acl,
        recursive: isRecursive,
      };

      // Show warning for recursive operations
      if (isRecursive) {
        toast.info(
          "Starting recursive ACL application. This may take a while for large directories...",
          { duration: 10000 },
        );
      }

      await setAcl({ path, data: request });
      toast.success(
        isRecursive
          ? "ACL applied recursively successfully"
          : "ACL saved successfully",
      );
      setIsDirty(false);
      setRecursiveDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(`Failed to save ACL: ${error.message}`);
    }
  };

  const handleAddAce = () => {
    setCurrentAce({
      principal: "everyone", // basic default
      ace_type: AceType.allow,
      permissions: { ...DEFAULT_PERMISSIONS },
      inherit_flags: { ...DEFAULT_INHERIT_FLAGS },
    });
    setEditingIndex(null);
    setEditDialogOpen(true);
  };

  const handleEditAce = (index: number) => {
    setCurrentAce({ ...aces[index] });
    setEditingIndex(index);
    setEditDialogOpen(true);
  };

  const handleDeleteAce = (index: number) => {
    const newAces = [...aces];
    newAces.splice(index, 1);
    setAces(newAces);
    setIsDirty(true);
  };

  const handleSaveAce = (ace: Nfs4Ace) => {
    const newAces = [...aces];
    if (editingIndex !== null) {
      newAces[editingIndex] = ace;
    } else {
      newAces.push(ace);
    }

    // Client-side validation
    const validationError = validateAcl(newAces);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Warning for dangerous permissions
    if (ace.permissions.write_acl || ace.permissions.write_owner) {
      toast.warning(
        `Warning: ACE grants sensitive permissions (${ace.permissions.write_acl ? "write_acl" : "write_owner"})`,
      );
    }

    setAces(newAces);
    setIsDirty(true);
    setEditDialogOpen(false);
  };

  // Validate ACL structure
  const validateAcl = (aclAces: Nfs4Ace[]): string | null => {
    // Check for owner@ presence
    const hasOwner = aclAces.some((ace) => ace.principal === "owner");
    if (!hasOwner) {
      return "ACL must contain an owner@ entry";
    }

    // Check for duplicate principal+type combinations
    const seen = new Set<string>();
    for (const ace of aclAces) {
      const key = `${JSON.stringify(ace.principal)}:${ace.ace_type}`;
      if (seen.has(key)) {
        return `Duplicate ACE found for principal with same type`;
      }
      seen.add(key);
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Access Control List (ACL)</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 mr-4">
            <Checkbox
              id="recursive"
              checked={recursive}
              onCheckedChange={(c) => setRecursive(!!c)}
            />
            <Label htmlFor="recursive">Apply Recursively</Label>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isSaving}
          >
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!isDirty || isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Principal</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Inheritance</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aces.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center h-24 text-muted-foreground"
                  >
                    No access control entries defined.
                  </TableCell>
                </TableRow>
              ) : (
                aces.map((ace, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <PrincipalDisplay principal={ace.principal} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          ace.ace_type === AceType.allow
                            ? "default"
                            : "destructive"
                        }
                      >
                        {ace.ace_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <PermissionsDisplay permissions={ace.permissions} />
                    </TableCell>
                    <TableCell>
                      <InheritanceDisplay flags={ace.inherit_flags} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditAce(index)}
                        >
                          <span className="sr-only">Edit</span>
                          <Users className="h-4 w-4" /> {/* Placeholder icon */}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteAce(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4">
          <Button onClick={handleAddAce}>
            <Plus className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
        </div>
      </CardContent>

      <AceDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        ace={currentAce}
        onSave={handleSaveAce}
      />

      <AclRecursiveDialog
        open={recursiveDialogOpen}
        onOpenChange={setRecursiveDialogOpen}
        onConfirm={() => performSave(true)}
        path={path}
      />
    </Card>
  );
}

// Sub-components

function PrincipalDisplay({ principal }: { principal: AcePrincipal }) {
  if (principal === "owner") return <Badge variant="outline">OWNER@</Badge>;
  if (principal === "group") return <Badge variant="outline">GROUP@</Badge>;
  if (principal === "everyone")
    return <Badge variant="outline">EVERYONE@</Badge>;

  if (typeof principal === "object") {
    if ("user" in principal) {
      return (
        <div className="flex items-center">
          <User className="mr-1 h-3 w-3" /> {principal.user}
        </div>
      );
    }
    if ("named_group" in principal) {
      return (
        <div className="flex items-center">
          <Users className="mr-1 h-3 w-3" /> {principal.named_group}
        </div>
      );
    }
  }

  return <span>{JSON.stringify(principal)}</span>;
}

function PermissionsDisplay({ permissions }: { permissions: Nfs4Permissions }) {
  // Simple summary
  if (permissions.read_data && permissions.write_data)
    return <span>Read/Write</span>;
  if (permissions.read_data) return <span>Read Only</span>;
  if (permissions.write_data) return <span>Write Only</span>;
  return <span>Custom</span>;
}

function InheritanceDisplay({ flags }: { flags: AceInheritFlags }) {
  const parts = [];
  if (flags.file_inherit) parts.push("File");
  if (flags.dir_inherit) parts.push("Dir");
  if (flags.no_propagate) parts.push("NoProp");
  if (flags.inherit_only) parts.push("InheritOnly");

  if (parts.length === 0)
    return <span className="text-muted-foreground">-</span>;
  return <span className="text-xs">{parts.join(", ")}</span>;
}

// Dialog for editing ACE
interface AceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ace: Nfs4Ace | null;
  onSave: (ace: Nfs4Ace) => void;
}

function AceDialog({ open, onOpenChange, ace, onSave }: AceDialogProps) {
  const [localAce, setLocalAce] = useState<Nfs4Ace | null>(null);
  const [principalType, setPrincipalType] = useState<
    "user" | "group" | "special"
  >("special");
  const [specialPrincipal, setSpecialPrincipal] = useState<string>("owner");
  const [principalName, setPrincipalName] = useState("");

  useEffect(() => {
    if (ace) {
      setLocalAce(JSON.parse(JSON.stringify(ace))); // Deep copy
      // Determine principal type for UI initialization
      if (
        ace.principal === "owner" ||
        ace.principal === "group" ||
        ace.principal === "everyone"
      ) {
        setPrincipalType("special");
        setSpecialPrincipal(ace.principal);
      } else if (typeof ace.principal === "object") {
        if ("user" in ace.principal) {
          setPrincipalType("user");
          setPrincipalName(ace.principal.user);
        } else if ("named_group" in ace.principal) {
          setPrincipalType("group");
          setPrincipalName(ace.principal.named_group);
        }
      }
    }
  }, [ace]);

  const handleSave = () => {
    if (!localAce) return;

    // Construct proper principal object
    let principal: AcePrincipal;
    if (principalType === "special") {
      principal = specialPrincipal as AcePrincipal;
    } else if (principalType === "user") {
      principal = { user: principalName };
    } else {
      principal = { named_group: principalName };
    }

    onSave({ ...localAce, principal });
  };

  if (!localAce) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Access Control Entry</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Principal Selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Principal Type</Label>
            <div className="col-span-3">
              <Select
                value={principalType}
                onValueChange={(v: "user" | "group" | "special") =>
                  setPrincipalType(v)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="special">Special Identity</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {principalType === "special" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Identity</Label>
              <div className="col-span-3">
                <Select
                  value={specialPrincipal}
                  onValueChange={setSpecialPrincipal}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner (owner@)</SelectItem>
                    <SelectItem value="group">Group (group@)</SelectItem>
                    <SelectItem value="everyone">
                      Everyone (everyone@)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {(principalType === "user" || principalType === "group") && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Name</Label>
              <div className="col-span-3">
                <PrincipalSearch
                  type={principalType}
                  value={principalName}
                  onChange={setPrincipalName}
                />
              </div>
            </div>
          )}

          {/* Type */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Type</Label>
            <div className="col-span-3">
              <Select
                value={localAce.ace_type}
                onValueChange={(v) =>
                  setLocalAce({ ...localAce, ace_type: v as AceType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AceType.allow}>Allow</SelectItem>
                  <SelectItem value={AceType.deny}>Deny</SelectItem>
                  <SelectItem value={AceType.audit}>Audit</SelectItem>
                  <SelectItem value={AceType.alarm}>Alarm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Permissions - Simplified for MVP */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right mt-2">Permissions</Label>
            <div className="col-span-3 grid grid-cols-2 gap-2">
              <PermissionCheckbox
                label="Read Data"
                checked={localAce.permissions.read_data}
                onChange={(c) =>
                  setLocalAce({
                    ...localAce,
                    permissions: { ...localAce.permissions, read_data: c },
                  })
                }
              />
              <PermissionCheckbox
                label="Write Data"
                checked={localAce.permissions.write_data}
                onChange={(c) =>
                  setLocalAce({
                    ...localAce,
                    permissions: { ...localAce.permissions, write_data: c },
                  })
                }
              />
              <PermissionCheckbox
                label="Execute"
                checked={localAce.permissions.execute}
                onChange={(c) =>
                  setLocalAce({
                    ...localAce,
                    permissions: { ...localAce.permissions, execute: c },
                  })
                }
              />
              <PermissionCheckbox
                label="Delete"
                checked={localAce.permissions.delete}
                onChange={(c) =>
                  setLocalAce({
                    ...localAce,
                    permissions: { ...localAce.permissions, delete: c },
                  })
                }
              />
              <PermissionCheckbox
                label="Append"
                checked={localAce.permissions.append_data}
                onChange={(c) =>
                  setLocalAce({
                    ...localAce,
                    permissions: { ...localAce.permissions, append_data: c },
                  })
                }
              />
            </div>
          </div>

          {/* Inheritance */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right mt-2">Inheritance</Label>
            <div className="col-span-3 grid grid-cols-2 gap-2">
              <PermissionCheckbox
                label="File Inherit"
                checked={localAce.inherit_flags.file_inherit}
                onChange={(c) =>
                  setLocalAce({
                    ...localAce,
                    inherit_flags: {
                      ...localAce.inherit_flags,
                      file_inherit: c,
                    },
                  })
                }
              />
              <PermissionCheckbox
                label="Dir Inherit"
                checked={localAce.inherit_flags.dir_inherit}
                onChange={(c) =>
                  setLocalAce({
                    ...localAce,
                    inherit_flags: {
                      ...localAce.inherit_flags,
                      dir_inherit: c,
                    },
                  })
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PermissionCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (c: boolean) => void;
}) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox checked={checked} onCheckedChange={(c) => onChange(!!c)} />
      <span className="text-sm">{label}</span>
    </div>
  );
}

function PrincipalSearch({
  type,
  value,
  onChange,
}: {
  type: "user" | "group";
  value: string;
  onChange: (v: string) => void;
}) {
  // Simple input for now, could be enhanced with useSearchAdPrincipals in the future for autocomplete
  // Implementing autocomplete would require a Combobox which is more complex in shadcn
  // Keeping it simple as per "primitive" plan
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Enter ${type} name...`}
    />
  );
}
