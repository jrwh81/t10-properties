class CommentPolicy < ApplicationPolicy
  def index? = true
  def create? = true

  def update?
    admin? || owner?
  end

  def destroy?
    admin? || owner?
  end

  private

  def owner?
    user && record.user_id == user.id
  end
end
