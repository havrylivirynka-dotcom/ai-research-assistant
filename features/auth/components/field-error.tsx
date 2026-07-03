export function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;

  return (
    <p role="alert" className="mt-1 text-sm text-destructive">
      {messages[0]}
    </p>
  );
}
