ALTER TABLE public.chat_messages ADD COLUMN client_id text;
CREATE UNIQUE INDEX chat_messages_client_id_idx ON public.chat_messages (client_id);