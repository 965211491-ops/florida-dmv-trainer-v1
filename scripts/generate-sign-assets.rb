# frozen_string_literal: true

# Generates lightweight study SVGs from the V2.1 knowledge-bank metadata.
# These are original study reconstructions, not sign-fabrication drawings.

require "cgi"
require "fileutils"

ROOT = File.expand_path("..", __dir__)
KNOWLEDGE_FILE = File.join(ROOT, "data", "knowledge", "signs.js")
OUTPUT_DIR = File.join(ROOT, "assets", "signs")

COLORS = {
  "red" => "#c81e1e",
  "white" => "#ffffff",
  "black" => "#111827",
  "yellow" => "#facc15",
  "orange" => "#f97316",
  "green" => "#15803d",
  "blue" => "#1d4ed8",
  "brown" => "#7c4a21",
  "fluorescent yellow-green" => "#b7e22d"
}.freeze

Sign = Struct.new(:id, :slug, :designation, :category, :shape, :colors, :name)

def read_signs
  pattern = /sign\("([^"]+)", "([^"]+)", "([^"]+)", "([^"]+)", "([^"]+)", \[([^\]]+)\], "([^"]+)"/
  File.readlines(KNOWLEDGE_FILE).map do |line|
    match = line.match(pattern)
    next unless match

    colors = match[6].scan(/"([^"]+)"/).flatten
    Sign.new(match[1], match[2], match[3], match[4], match[5], colors, match[7])
  end.compact
end

def escape(value)
  CGI.escapeHTML(value.to_s)
end

def text_markup(text, color, y: 93, max_lines: 4, max_size: 30)
  words = text.split
  lines = []
  words.each do |word|
    if lines.empty? || (lines.last.length + word.length + 1 > 12 && lines.length < max_lines)
      lines << word
    else
      lines[-1] = "#{lines[-1]} #{word}"
    end
  end
  lines = lines.first(max_lines)
  longest = lines.map(&:length).max || 1
  size = [[(152.0 / (longest * 0.62)).floor, 15].max, max_size].min
  start_y = y - ((lines.length - 1) * (size + 4) / 2.0)
  lines.each_with_index.map do |line, index|
    %(<text x="100" y="#{start_y + index * (size + 4)}" text-anchor="middle" fill="#{color}" font-family="Arial,Helvetica,sans-serif" font-size="#{size}" font-weight="800">#{escape(line)}</text>)
  end.join
end

def arrow(direction, x: 100, y: 100, color: "#111827")
  transforms = { "right" => 0, "down" => 90, "left" => 180, "up" => -90 }
  degree = transforms.fetch(direction, 0)
  %(<g transform="translate(#{x} #{y}) rotate(#{degree})"><path d="M-48-10H15V-28L52 0 15 28V10H-48Z" fill="#{color}"/></g>)
end

def prohibition(body)
  %(<circle cx="100" cy="100" r="67" fill="none" stroke="#c81e1e" stroke-width="13"/>#{body}<path d="M52 52 148 148" stroke="#c81e1e" stroke-width="14" stroke-linecap="round"/>)
end

def bicycle(color = "#111827")
  %(<g fill="none" stroke="#{color}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><circle cx="65" cy="122" r="27"/><circle cx="137" cy="122" r="27"/><path d="m65 122 28-42 28 42H65l20-27h42M93 80h24M88 68h17"/></g>)
end

def pedestrian(color = "#111827")
  %(<g fill="#{color}" stroke="#{color}" stroke-width="7" stroke-linecap="round"><circle cx="104" cy="52" r="11"/><path d="M101 70 87 108l-27 28m30-31 27 35m-22-61 28 22m-31-14-25 12" fill="none"/></g>)
end

def warning_symbol(slug)
  common = "#111827"
  case slug
  when "stop" then text_markup("STOP", "#fff", y: 113, max_lines: 1, max_size: 38)
  when "sharp-turn" then %(<path d="M88 145V82q0-35 35-35h12" fill="none" stroke="#{common}" stroke-width="14" stroke-linecap="round"/><path d="m128 28 30 19-30 19z" fill="#{common}"/>)
  when "curve" then %(<path d="M83 150q0-45 35-67t22-54" fill="none" stroke="#{common}" stroke-width="14" stroke-linecap="round"/><path d="m126 34 26-22 2 34z" fill="#{common}"/>)
  when "reverse-turn" then %(<path d="M80 151V93q0-30 28-30h18q20 0 20-20" fill="none" stroke="#{common}" stroke-width="13"/><path d="m132 42 17-26 15 28z" fill="#{common}"/>)
  when "winding-road" then %(<path d="M91 155q-17-25 8-45t0-42q-24-20 5-44" fill="none" stroke="#{common}" stroke-width="13" stroke-linecap="round"/><path d="m93 30 13-24 13 25z" fill="#{common}"/>)
  when "crossroad" then %(<path d="M100 35v130M45 92h110" stroke="#{common}" stroke-width="15" stroke-linecap="round"/>)
  when "side-road" then %(<path d="M90 32v136M90 92h63" stroke="#{common}" stroke-width="15" stroke-linecap="round"/>)
  when "t-intersection" then %(<path d="M100 95v70M40 78h120" stroke="#{common}" stroke-width="15" stroke-linecap="round"/>)
  when "y-intersection" then %(<path d="M100 165V95M100 105 58 45M100 105l42-60" stroke="#{common}" stroke-width="15" stroke-linecap="round"/>)
  when "roundabout-ahead" then %(<g fill="none" stroke="#{common}" stroke-width="10"><path d="M63 74a47 47 0 0 1 69-8"/><path d="m124 47 25 22-30 9" fill="#{common}"/><path d="M139 100a47 47 0 0 1-38 46"/><path d="m116 155-30-8 20-24" fill="#{common}"/><path d="M67 132a47 47 0 0 1-7-41"/><path d="m43 97 15-28 16 27" fill="#{common}"/></g>)
  when "stop-ahead" then %(<path d="M76 49h48l30 30v48l-30 30H76l-30-30V79z" fill="#{common}"/>#{text_markup("STOP", "#facc15", y: 111, max_lines: 1)})
  when "yield-ahead" then %(<path d="M100 151 48 55h104z" fill="none" stroke="#{common}" stroke-width="13"/>)
  when "traffic-signal-ahead" then %(<rect x="76" y="35" width="48" height="130" rx="18" fill="#{common}"/><circle cx="100" cy="66" r="14" fill="#dc2626"/><circle cx="100" cy="100" r="14" fill="#facc15"/><circle cx="100" cy="134" r="14" fill="#16a34a"/>)
  when "merge" then %(<path d="M82 155V39M137 151q-2-53-55-70" fill="none" stroke="#{common}" stroke-width="13"/><path d="m68 47 14-25 14 25z" fill="#{common}"/>)
  when "lane-ends" then %(<path d="M73 155V40M137 155q0-52-64-73" fill="none" stroke="#{common}" stroke-width="12"/><path d="m59 47 14-25 14 25z" fill="#{common}"/>)
  when "added-lane" then %(<path d="M74 155V37M137 155q0-55-38-77v-41" fill="none" stroke="#{common}" stroke-width="12"/><path d="m60 44 14-25 14 25zm25 0 14-25 14 25z" fill="#{common}"/>)
  when "road-narrows" then %(<path d="M58 160 83 37m59 123L117 37" stroke="#{common}" stroke-width="14" stroke-linecap="round"/>)
  when "narrow-bridge" then %(<path d="M55 160 78 105V37m70 123-23-55V37" stroke="#{common}" stroke-width="14" stroke-linecap="round"/>)
  when "divided-highway" then %(<path d="M65 155V50m70 105V50" stroke="#{common}" stroke-width="12"/><path d="m51 57 14-25 14 25zm70 0 14-25 14 25z" fill="#{common}"/><path d="M91 155V84h18v71z" fill="#{common}"/>)
  when "divided-highway-ends" then %(<path d="M65 155q0-48 35-67m35 67q0-48-35-67" fill="none" stroke="#{common}" stroke-width="12"/><path d="M91 89V37h18v52z" fill="#{common}"/>)
  when "two-way-traffic" then %(<path d="M75 151V50m50-1v101" stroke="#{common}" stroke-width="13"/><path d="m60 57 15-27 15 27zm50 86 15 27 15-27z" fill="#{common}"/>)
  when "hill" then %(<path d="M38 134h124" stroke="#{common}" stroke-width="9"/><path d="m48 125 93-68" stroke="#{common}" stroke-width="14"/><rect x="79" y="83" width="47" height="25" rx="3" transform="rotate(-35 102 96)" fill="#{common}"/><circle cx="83" cy="113" r="9" fill="#{common}"/><circle cx="124" cy="83" r="9" fill="#{common}"/>)
  when "bump" then %(<path d="M42 125h30q8-45 28-45t28 45h30" fill="none" stroke="#{common}" stroke-width="14" stroke-linecap="round"/>)
  when "dip" then %(<path d="M42 82h30q8 45 28 45t28-45h30" fill="none" stroke="#{common}" stroke-width="14" stroke-linecap="round"/>)
  when "slippery-when-wet" then %(<path d="M61 97h78l-11-25H75z" fill="#{common}"/><rect x="52" y="94" width="96" height="35" rx="8" fill="#{common}"/><circle cx="75" cy="132" r="10" fill="#{common}"/><circle cx="127" cy="132" r="10" fill="#{common}"/><path d="M55 148q24-18 45 0t45 0" fill="none" stroke="#{common}" stroke-width="7"/>)
  when "loose-gravel" then %(<path d="M55 104h90l-13-27H70z" fill="#{common}"/><rect x="48" y="100" width="104" height="32" rx="7" fill="#{common}"/><circle cx="72" cy="135" r="10"/><circle cx="130" cy="135" r="10"/><g fill="#{common}"><circle cx="42" cy="146" r="5"/><circle cx="29" cy="132" r="4"/><circle cx="158" cy="146" r="5"/><circle cx="171" cy="132" r="4"/></g>)
  when "bicycle-crossing" then bicycle
  when "pedestrian-crossing" then pedestrian
  when "deer-crossing" then %(<path d="M48 116q12-35 45-35h25l24-22 11 8-18 27 14 29-13 7-20-24H86l-13 42H59l5-44-20 20z" fill="#{common}"/><path d="m134 63 5-21m4 20 13-16" stroke="#{common}" stroke-width="6"/>)
  when "low-clearance" then %(<path d="M52 58h96M52 142h96" stroke="#{common}" stroke-width="9"/><path d="M100 63v74m-14-62 14-20 14 20m-28 50 14 20 14-20" fill="none" stroke="#{common}" stroke-width="8"/>#{text_markup(%q(12'-6"), common, y: 109, max_lines: 1)})
  else nil
  end
end

def custom_content(sign, foreground)
  slug = sign.slug
  warning = warning_symbol(slug)
  return warning if warning

  case slug
  when "yield" then %(<path d="M100 157 30 35h140z" fill="#fff" stroke="#fff" stroke-width="5"/>#{text_markup("YIELD", "#c81e1e", y: 98, max_lines: 1)})
  when "no-right-turn" then prohibition(%(<path d="M82 145V93q0-31 34-31h22" fill="none" stroke="#111827" stroke-width="13"/><path d="m131 44 27 18-27 18z" fill="#111827"/>))
  when "no-left-turn" then prohibition(%(<path d="M118 145V93q0-31-34-31H62" fill="none" stroke="#111827" stroke-width="13"/><path d="m69 44-27 18 27 18z" fill="#111827"/>))
  when "no-u-turn" then prohibition(%(<path d="M128 145V91q0-39-30-39T68 91v25" fill="none" stroke="#111827" stroke-width="13"/><path d="m50 107 18 28 18-28z" fill="#111827"/>))
  when "left-turn-only" then arrow("left", x: 100, y: 78) + text_markup("ONLY", foreground, y: 146, max_lines: 1)
  when "thru-or-right" then arrow("up", x: 82, y: 78) + arrow("right", x: 113, y: 116)
  when "keep-right" then arrow("right", x: 100, y: 100)
  when "keep-left" then arrow("left", x: 100, y: 100)
  when "two-way-left-turn-only" then %(<path d="M76 155V68q0-24 22-24h18" fill="none" stroke="#111827" stroke-width="12"/><path d="m111 28 27 16-27 16z"/><path d="M124 45v87q0 24-22 24H84" fill="none" stroke="#111827" stroke-width="12"/><path d="m89 140-27 16 27 16z"/>)
  when "do-not-enter" then %(<rect x="39" y="86" width="122" height="28" rx="4" fill="#fff"/>)
  when "no-bicycles" then prohibition(bicycle)
  when "no-pedestrians" then prohibition(pedestrian)
  when "one-way" then arrow("right") + text_markup("ONE WAY", foreground, y: 52, max_lines: 1)
  when "school-crossing" then pedestrian + %(<g transform="translate(45 25) scale(.65)">#{pedestrian}</g>)
  when "school-bus-stop-ahead" then %(<rect x="45" y="73" width="110" height="65" rx="8" fill="#111827"/><rect x="59" y="82" width="78" height="24" fill="#b7e22d"/><circle cx="70" cy="143" r="11"/><circle cx="132" cy="143" r="11"/>)
  when "railroad-crossing-ahead" then text_markup("X", foreground, y: 103, max_lines: 1) + text_markup("R R", foreground, y: 143, max_lines: 1)
  when "railroad-crossbuck" then %(<g transform="translate(100 100)"><rect x="-86" y="-17" width="172" height="34" fill="#fff" stroke="#111827" stroke-width="3" transform="rotate(45)"/><rect x="-86" y="-17" width="172" height="34" fill="#fff" stroke="#111827" stroke-width="3" transform="rotate(-45)"/></g><text x="100" y="58" text-anchor="middle" font-family="Arial" font-size="15" font-weight="800" transform="rotate(45 100 100)">RAILROAD</text><text x="100" y="58" text-anchor="middle" font-family="Arial" font-size="15" font-weight="800" transform="rotate(-45 100 100)">CROSSING</text>)
  when "interstate-route" then text_markup("INTERSTATE", "#fff", y: 67, max_lines: 1, max_size: 18) + text_markup("95", "#fff", y: 126, max_lines: 1)
  when "us-route" then text_markup("US", "#111827", y: 66, max_lines: 1) + text_markup("1", "#111827", y: 128, max_lines: 1)
  when "state-route" then text_markup("STATE", "#111827", y: 66, max_lines: 1) + text_markup("50", "#111827", y: 128, max_lines: 1)
  when "gas-service" then %(<rect x="67" y="49" width="60" height="103" rx="6" fill="none" stroke="#fff" stroke-width="10"/><rect x="79" y="62" width="36" height="30" fill="#fff"/><path d="M127 72h17v58q0 12 12 12" fill="none" stroke="#fff" stroke-width="9"/>)
  when "food-service" then %(<path d="M67 45v110m-15-110v48q0 14 15 14t15-14V45m48 0v110m0-110q-25 18-25 54h25" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round"/>)
  when "lodging-service" then %(<path d="M45 143V66m0 50h110v27m-110-48h36q20 0 20 21m0 0h54V87q0-18-18-18h-36" fill="none" stroke="#fff" stroke-width="11"/>)
  when "hospital-service" then text_markup("H", "#fff", y: 123, max_lines: 1)
  when "recreation-area" then %(<path d="M38 147 83 70l25 42 17-29 38 64z" fill="#fff"/><circle cx="145" cy="57" r="16" fill="#fff"/>)
  when "flagger" then pedestrian + %(<path d="M126 68v-35m0 5 42 12-42 13" fill="#111827" stroke="#111827" stroke-width="7"/>)
  when "workers" then pedestrian + %(<path d="M72 135h75m-36-31 30 36" stroke="#111827" stroke-width="9"/>)
  when "detour-direction" then text_markup("DETOUR", foreground, y: 68, max_lines: 1) + arrow("right", x: 100, y: 126, color: foreground)
  else nil
  end
end

def shape_markup(sign, background)
  if sign.slug == "interstate-route"
    return %(<path d="M26 35q74-25 148 0v65q0 54-74 86-74-32-74-86z" fill="#1d4ed8" stroke="#fff" stroke-width="6"/><path d="M31 38q69-22 138 0v38H31z" fill="#c81e1e"/>)
  end
  if %w[us-route state-route].include?(sign.slug)
    return %(<path d="M26 35q74-25 148 0v65q0 54-74 86-74-32-74-86z" fill="#fff" stroke="#111827" stroke-width="6"/>)
  end

  case sign.shape
  when "octagon" then %(<path d="M63 13h74l50 50v74l-50 50H63l-50-50V63z" fill="#{background}" stroke="#fff" stroke-width="6"/>)
  when "triangle" then %(<path d="M100 181 14 28h172z" fill="#{background}" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>)
  when "circle" then %(<circle cx="100" cy="100" r="84" fill="#{background}" stroke="#fff" stroke-width="6"/>)
  when "diamond" then %(<rect x="29" y="29" width="142" height="142" rx="8" transform="rotate(45 100 100)" fill="#{background}" stroke="#111827" stroke-width="5"/>)
  when "pentagon" then %(<path d="M100 13 184 77l-31 110H47L16 77z" fill="#{background}" stroke="#111827" stroke-width="5"/>)
  when "pennant" then %(<path d="M16 32 184 100 16 168z" fill="#{background}" stroke="#111827" stroke-width="5"/>)
  when "crossbuck" then ""
  when "shield" then %(<path d="M26 35q74-25 148 0v65q0 54-74 86-74-32-74-86z" fill="#{background}" stroke="#fff" stroke-width="6"/>)
  else %(<rect x="20" y="20" width="160" height="160" rx="10" fill="#{background}" stroke="#{sign.category == 'work_zone' ? '#111827' : '#ffffff'}" stroke-width="5"/>)
  end
end

def background_for(sign)
  return COLORS["orange"] if sign.category == "work_zone"
  return sign.colors.include?("fluorescent yellow-green") ? COLORS["fluorescent yellow-green"] : COLORS["yellow"] if sign.category == "warning"
  return sign.slug == "end-school-zone" ? COLORS["white"] : COLORS["fluorescent yellow-green"] if sign.category == "school"
  return sign.slug == "railroad-crossing-ahead" ? COLORS["yellow"] : COLORS["white"] if sign.category == "railroad"
  if sign.category == "guide"
    return COLORS["white"] if %w[us-route state-route junction].include?(sign.slug)
    return COLORS["red"] if sign.slug == "interstate-route"
    return COLORS["green"] if %w[destination-guide exit-number mileage-guide].include?(sign.slug)
    return COLORS["brown"] if sign.slug == "recreation-area"
    return COLORS["blue"]
  end
  return COLORS["red"] if %w[stop yield do-not-enter wrong-way].include?(sign.slug)

  COLORS["white"]
end

def render_svg(sign)
  background = background_for(sign)
  foreground = if [COLORS["white"], COLORS["yellow"], COLORS["orange"], COLORS["fluorescent yellow-green"]].include?(background)
                 COLORS["black"]
               else
                 COLORS["white"]
               end
  base = shape_markup(sign, background)
  base_line = base.empty? ? "" : "  #{base}"
  body = custom_content(sign, foreground)
  unless body
    max_size = if sign.category == "work_zone"
                 20
               elsif sign.category == "guide"
                 22
               else
                 24
               end
    body = text_markup(sign.name, foreground, max_size: max_size)
  end
  body_line = body.empty? ? "" : "  #{body}"
  <<~SVG
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-labelledby="title desc">
      <title id="title">#{escape(sign.name)} (#{escape(sign.designation)})</title>
      <desc id="desc">Original study reconstruction of the #{escape(sign.name)} traffic sign, based on FHWA MUTCD conventions. Not a fabrication drawing.</desc>
      <rect width="200" height="200" rx="16" fill="#f8fafc"/>
    #{base_line}
    #{body_line}
    </svg>
  SVG
end

signs = read_signs
abort "Expected 84 sign records, found #{signs.length}" unless signs.length == 84

FileUtils.mkdir_p(OUTPUT_DIR)
signs.each do |sign|
  File.write(File.join(OUTPUT_DIR, "#{sign.slug}.svg"), render_svg(sign))
end

puts "Generated #{signs.length} SVG study assets in #{OUTPUT_DIR}"
