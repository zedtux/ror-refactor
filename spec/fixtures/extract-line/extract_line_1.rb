class ExtractLine

  def build_option_hash
    { sitemap_language: :fr, sitemap_host: Rails.application.config.sitemap.sitemap_host,
      sitemap_compress: false }
  end
end
