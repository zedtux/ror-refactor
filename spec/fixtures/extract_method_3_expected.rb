class ExtractMethod
  belongs_to :user
  default_scope { where(soft_deleted: false) }
  
  def 
    user = User.find(user_id)
    user.is_admin = true
    user.updated_by = current_user
    user.send_notification_email = true
    user.save
  end

  def my_too_long_method
    
  end
end
