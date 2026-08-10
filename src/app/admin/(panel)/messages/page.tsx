import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { formatDateTime } from "@/lib/utils";
import type { ContactMessage } from "@/lib/types";
import { deleteMessage, setMessageRead } from "@/lib/actions/admin/messages";

export const metadata: Metadata = { title: "Messages — Admin" };

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  const messages = (data ?? []) as ContactMessage[];
  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-ink">Messages</h1>
        {unread > 0 && <Badge tone="amber">{unread} unread</Badge>}
      </div>

      {messages.length === 0 ? (
        <EmptyState
          title="No messages yet"
          description="Messages submitted through the contact form will appear here."
        />
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <article
              key={m.id}
              className={`rounded-2xl bg-white p-4 shadow-sm ${m.is_read ? "opacity-75" : ""}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-ink">{m.name}</span>
                <span className="min-w-0 break-all text-sm text-ink/60">{m.contact}</span>
                {!m.is_read && <Badge tone="blue">New</Badge>}
                <span className="ml-auto text-xs text-ink/50">{formatDateTime(m.created_at)}</span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-ink/80">{m.message}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <form action={setMessageRead}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="is_read" value={String(!m.is_read)} />
                  <Button size="sm" variant="outline" type="submit">
                    {m.is_read ? "Mark as unread" : "Mark as read"}
                  </Button>
                </form>
                <form action={deleteMessage}>
                  <input type="hidden" name="id" value={m.id} />
                  <Button size="sm" variant="danger" type="submit">
                    Delete
                  </Button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
