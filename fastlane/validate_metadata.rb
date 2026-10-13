require 'json'
root=File.join(__dir__,'metadata/ios')
limits={'name.txt'=>30,'subtitle.txt'=>30,'keywords.txt'=>100,'description.txt'=>4000,'promotional_text.txt'=>170,'release_notes.txt'=>4000}
errors=[]
locales=Dir.children(root).select{|name|File.directory?(File.join(root,name))}.sort
locales.each do |locale|
 limits.each do |file,limit|
  path=File.join(root,locale,file)
  text=File.exist?(path) ? File.read(path).strip : ''
  errors<<"#{locale}/#{file} is blank" if text.empty?
  errors<<"#{locale}/#{file} exceeds #{limit} characters" if text.length>limit
  errors<<"#{locale}/#{file} contains a placeholder or private key" if text.match?(/TODO|PLACEHOLDER|-----BEGIN|sk-ant-|sk-proj-/)
  if file=='keywords.txt'
   terms=text.split(',').map{|x|x.strip.downcase}
   errors<<"#{locale}: duplicate keywords" unless terms.uniq.length==terms.length
   errors<<"#{locale}: keywords exceed conservative 100-byte cap" if text.bytesize>100
  end
 end
 %w[privacy_url.txt support_url.txt marketing_url.txt].each do |file|
  path=File.join(root,locale,file);errors<<"#{locale}/#{file}: HTTPS URL required" unless File.file?(path)&&File.read(path).strip.start_with?('https://')
 end
end
abort(errors.join("\n")) unless errors.empty?
puts "Validated #{locales.length} locales: complete text, length limits, unique keywords, HTTPS URLs."
