-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Also enable for chats to get updates on last message
ALTER PUBLICATION supabase_realtime ADD TABLE chats;
