class ExtractMethod
  belongs_to :user
  def my_too_long_method
    user = User.find(user_id)
    user.is_admin = true
    user.updated_by = current_user
    user.send_notification_email = true
    user.save
  end
end
