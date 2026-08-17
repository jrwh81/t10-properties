class CommentSerializer
  def initialize(comment, with_replies: false)
    @comment = comment
    @with_replies = with_replies
  end

  def as_json(*)
    base = {
      id: comment.id,
      body: comment.body,
      author_name: comment.author_name,
      is_guest: comment.guest_comment?,
      approved: comment.approved,
      parent_id: comment.parent_id,
      created_at: comment.created_at
    }

    return base unless with_replies

    base.merge(replies: comment.replies.approved.oldest_first.map { |reply| CommentSerializer.new(reply).as_json })
  end

  private

  attr_reader :comment, :with_replies
end
