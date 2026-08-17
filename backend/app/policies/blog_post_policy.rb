class BlogPostPolicy < ApplicationPolicy
  def index? = true

  def show?
    record.published? || admin? || owner?
  end

  def create? = admin?
  def update? = admin?
  def destroy? = admin?

  private

  def owner?
    user && record.author_id == user.id
  end

  class Scope < Scope
    def resolve
      admin? ? scope.all : scope.published
    end

    private

    def admin?
      user&.admin?
    end
  end
end
