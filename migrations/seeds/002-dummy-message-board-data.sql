-- migrations/seeds/002-dummy-message-board-data.sql

-- Seed data for Categories
INSERT INTO categories (title, description) VALUES
('General Discussion', 'A place for general chit-chat and topics that don''t fit elsewhere.'),
('News and Announcements', 'Official news and announcements from the forum administrators.'),
('Feedback', 'Share your feedback and suggestions about the forum.'),
('Support', 'Need help? Post your questions and get support here.'),
('Off-Topic', 'The place for conversations that don''t necessarily relate to the other forums.'),
('Tech Talk', 'Discussion about technology, programming, and development.'),
('Gaming', 'For discussions about video games, gaming hardware, and the gaming industry.'),
('Entertainment', 'Movies, music, television and other forms of entertainment.'),
('Sports', 'Talk about your favorite sports, teams, events, and athletes.');

-- Note: Ensure an admin user is registered with the user ID provided below for seeding purposes.
-- The following user ID should be replaced with the actual admin user ID after registration.
-- User ID used here as an example: b683c183-3c7d-4e2b-9020-0bfd70a7eac5

-- Seed data for Welcome Threads by Admin
INSERT INTO threads (category_id, user_id, title, pinned, locked)
VALUES
  ((SELECT id FROM categories WHERE title = 'General Discussion'), 'b683c183-3c7d-4e2b-9020-0bfd70a7eac5', 'Welcome to the General Discussion Forum!', TRUE, FALSE),
  ((SELECT id FROM categories WHERE title = 'News and Announcements'), 'b683c183-3c7d-4e2b-9020-0bfd70a7eac5', 'Welcome to News and Announcements', TRUE, FALSE),
  ((SELECT id FROM categories WHERE title = 'Feedback'), 'b683c183-3c7d-4e2b-9020-0bfd70a7eac5', 'Welcome to Feedback', TRUE, FALSE),
  ((SELECT id FROM categories WHERE title = 'Support'), 'b683c183-3c7d-4e2b-9020-0bfd70a7eac5', 'Welcome to Support', TRUE, FALSE),
  ((SELECT id FROM categories WHERE title = 'Off-Topic'), 'b683c183-3c7d-4e2b-9020-0bfd70a7eac5', 'Welcome to Off-Topic', TRUE, FALSE),
  ((SELECT id FROM categories WHERE title = 'Tech Talk'), 'b683c183-3c7d-4e2b-9020-0bfd70a7eac5', 'Welcome to Tech Talk', TRUE, FALSE),
  ((SELECT id FROM categories WHERE title = 'Gaming'), 'b683c183-3c7d-4e2b-9020-0bfd70a7eac5', 'Welcome to Gaming', TRUE, FALSE),
  ((SELECT id FROM categories WHERE title = 'Entertainment'), 'b683c183-3c7d-4e2b-9020-0bfd70a7eac5', 'Welcome to Entertainment', TRUE, FALSE),
  ((SELECT id FROM categories WHERE title = 'Sports'), 'b683c183-3c7d-4e2b-9020-0bfd70a7eac5', 'Welcome to Sports', TRUE, FALSE);


INSERT INTO posts (thread_id, user_id, content)
VALUES
  ((SELECT id FROM threads WHERE title = 'Welcome to the General Discussion Forum!'), 'b683c183-3c7d-4e2b-9020-0bfd70a7eac5', 'Welcome everyone to the General Discussion forum! Feel free to share anything that''s on your mind.'),
  ((SELECT id FROM threads WHERE title = 'Welcome to News and Announcements'), 'b683c183-3c7d-4e2b-9020-0bfd70a7eac5', 'Stay tuned for the latest news and announcements about our forum.'),
  ((SELECT id FROM threads WHERE title = 'Welcome to Feedback'), 'b683c183-3c7d-4e2b-9020-0bfd70a7eac5', 'Your feedback is invaluable to us. Let us know your thoughts and suggestions.'),
  ((SELECT id FROM threads WHERE title = 'Welcome to Support'), 'b683c183-3c7d-4e2b-9020-0bfd70a7eac5', 'Need help? Feel free to ask your questions here, and we''ll do our best to assist you.'),
  ((SELECT id FROM threads WHERE title = 'Welcome to Off-Topic'), 'b683c183-3c7d-4e2b-9020-0bfd70a7eac5', 'This is your space for any off-topic chat. What''s on your mind today?'),
  ((SELECT id FROM threads WHERE title = 'Welcome to Tech Talk'), 'b683c183-3c7d-4e2b-9020-0bfd70a7eac5', 'Let''s talk about technology, programming, and everything in between.'),
  ((SELECT id FROM threads WHERE title = 'Welcome to Gaming'), 'b683c183-3c7d-4e2b-9020-0bfd70a7eac5', 'Gamers unite! Discuss your favorite games, gaming news, and strategies.'),
  ((SELECT id FROM threads WHERE title = 'Welcome to Entertainment'), 'b683c183-3c7d-4e2b-9020-0bfd70a7eac5', 'Movies, music, TV shows, and more! What''s your favorite form of entertainment?'),
  ((SELECT id FROM threads WHERE title = 'Welcome to Sports'), 'b683c183-3c7d-4e2b-9020-0bfd70a7eac5', 'Sports enthusiasts gather here! Share your love for sports, teams, and athletes.');
