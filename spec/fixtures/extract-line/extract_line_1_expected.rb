class ExtractLine

  def 
    Rails.application.config.sitemap.sitemap_host
  end
  
  def build_option_hash
    { sitemap_language: :fr, sitemap_host: ,
      sitemap_compress: false }
  end
end
