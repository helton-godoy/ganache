import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AclRecursiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  path: string;
}

export function AclRecursiveDialog({
  open,
  onOpenChange,
  onConfirm,
  path, // Destructure path prop
}: AclRecursiveDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apply Permissions Recursively?</AlertDialogTitle>
          <AlertDialogDescription>
            <p className="text-sm text-muted-foreground">
              This will apply ACL changes to all files and subdirectories under{" "}
              <code className="text-xs bg-muted px-1 rounded">{path}</code>.
            </p>
            <p className="text-sm text-amber-600 mt-2">
              ⚠️ <strong>Note:</strong> For directories with many files, this
              operation may take several seconds to minutes. The operation runs
              synchronously and cannot be canceled once started.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              This action will replace the permissions for all files and
              subdirectories within this share. This process might take a while
              for large directory structures.
              <br />
              <br />
              <strong>A snapshot won't be created automatically.</strong> Make
              sure you have a backup if needed.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Apply Recursively
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
