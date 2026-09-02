#!/usr/bin/env ruby
# frozen_string_literal: true

require "fileutils"

ROOT = File.expand_path("..", __dir__)
MARKINGS = File.join(ROOT, "assets/florida/markings")
SIGNALS = File.join(ROOT, "assets/florida/signals")
LANES = File.join(ROOT, "assets/florida/lane-signals")
[MARKINGS, SIGNALS, LANES].each { |directory| FileUtils.mkdir_p(directory) }

def svg(label, body, description = label)
  <<~SVG
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img" aria-labelledby="title desc">
      <title id="title">#{label}</title>
      <desc id="desc">#{description}</desc>
      <rect width="640" height="360" rx="24" fill="#eef2f6"/>
      #{body}
    </svg>
  SVG
end

def road(lines, extras = "")
  <<~SVG
    <rect x="80" width="480" height="360" fill="#454b52"/>
    <rect x="76" width="4" height="360" fill="#cbd5e1"/>
    <rect x="560" width="4" height="360" fill="#cbd5e1"/>
    <path d="M104 0v360M536 0v360" stroke="#fff" stroke-width="8"/>
    #{lines}
    #{extras}
  SVG
end


markings = {
  "broken-white" => ["Broken white lane line", road('<path d="M320 0v58m0 42v58m0 42v58m0 42v60" stroke="#fff" stroke-width="10"/>')],
  "solid-white" => ["Solid white lane line", road('<path d="M320 0v360" stroke="#fff" stroke-width="10"/>')],
  "double-white" => ["Double solid white lines", road('<path d="M309 0v360M331 0v360" stroke="#fff" stroke-width="8"/>')],
  "broken-yellow" => ["Broken yellow center line", road('<path d="M320 0v58m0 42v58m0 42v58m0 42v60" stroke="#facc15" stroke-width="10"/>')],
  "double-solid-yellow" => ["Double solid yellow center lines", road('<path d="M309 0v360M331 0v360" stroke="#facc15" stroke-width="8"/>')],
  "solid-yellow-your-side" => ["Solid yellow line on your side", road('<path d="M307 0v360" stroke="#facc15" stroke-width="9"/><path d="M333 0v58m0 42v58m0 42v58m0 42v60" stroke="#facc15" stroke-width="9"/>', '<path d="M216 305l32-22v14h36v16h-36v14z" fill="#dbeafe"/>')],
  "broken-yellow-your-side" => ["Broken yellow line on your side", road('<path d="M307 0v58m0 42v58m0 42v58m0 42v60" stroke="#facc15" stroke-width="9"/><path d="M333 0v360" stroke="#facc15" stroke-width="9"/>', '<path d="M216 305l32-22v14h36v16h-36v14z" fill="#dbeafe"/>')],
  "stop-line-crosswalk" => ["Stop line and crosswalk", road('', '<path d="M104 258h432" stroke="#fff" stroke-width="14"/><path d="M116 172v52m44-52v52m44-52v52m44-52v52m44-52v52m44-52v52m44-52v52m44-52v52m44-52v52m44-52v52" stroke="#fff" stroke-width="25"/>')],
  "left-turn-only" => ["Left turn only pavement arrow", road('', '<path d="M320 285v-142h-42l42-54 42 54h-28v142z" fill="#fff" transform="rotate(-45 320 175)"/><text x="320" y="330" fill="#fff" font-size="28" font-family="Arial" font-weight="700" text-anchor="middle">ONLY</text>')],
  "straight-or-turn" => ["Straight or turn pavement arrows", road('', '<path d="M300 284V118l-26 28-14-14 50-54 50 54-14 14-26-28v166z" fill="#fff"/><path d="M320 230h72v-30l54 40-54 40v-28h-72z" fill="#fff"/>')],
  "center-turn-lane" => ["Two-way left-turn center lane", road('<path d="M258 0v360M382 0v360" stroke="#facc15" stroke-width="8"/>', '<path d="M320 72v80h-25l25 38 25-38h-25M320 288v-80h25l-25-38-25 38h25" fill="none" stroke="#fff" stroke-width="10" stroke-linejoin="round"/>')],
  "reversible-lane" => ["Reversible lane markings", road('<path d="M258 0v360M382 0v360" stroke="#facc15" stroke-width="8" stroke-dasharray="42 24"/>', '<path d="M320 78v86m0 0-28-34m28 34 28-34M320 282v-86m0 0-28 34m28-34 28 34" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>')],
  "bicycle-lane" => ["Bicycle lane marking", road('<path d="M430 0v360" stroke="#fff" stroke-width="8"/>', '<circle cx="478" cy="205" r="24" fill="none" stroke="#fff" stroke-width="7"/><circle cx="514" cy="205" r="24" fill="none" stroke="#fff" stroke-width="7"/><path d="M478 205l18-35 18 35m-18-35-13-18h22m-9 18 18-30" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/><path d="M496 100v-45m0 0-23 28m23-28 23 28" fill="none" stroke="#fff" stroke-width="8"/>')],
  "sharrow" => ["Shared lane bicycle marking", road('', '<path d="M320 70l-42 38h27v42h30v-42h27zM320 16l-42 38h27v28h30V54h27z" fill="#fff"/><circle cx="294" cy="230" r="31" fill="none" stroke="#fff" stroke-width="8"/><circle cx="348" cy="230" r="31" fill="none" stroke="#fff" stroke-width="8"/><path d="M294 230l27-52 27 52m-27-52-22-25h35m-13 25 30-43" fill="none" stroke="#fff" stroke-width="8"/>')],
  "red-reflectors-wrong-way" => ["Red reflectors facing the driver", road('<path d="M320 0v360" stroke="#fff" stroke-width="5" stroke-dasharray="50 34"/>', '<g fill="#ef4444" stroke="#fecaca" stroke-width="3"><circle cx="320" cy="56" r="10"/><circle cx="320" cy="132" r="10"/><circle cx="320" cy="208" r="10"/><circle cx="320" cy="284" r="10"/></g><path d="M216 305l32-22v14h36v16h-36v14z" fill="#dbeafe"/>')]
}

markings.each do |name, (label, body)|
  File.write(File.join(MARKINGS, "#{name}.svg"), svg(label, body))
end

signal_colors = { "red" => "#ef4444", "yellow" => "#facc15", "green" => "#22c55e" }
%w[red yellow green].each do |active|
  lamps = %w[red yellow green].each_with_index.map do |color, index|
    fill = color == active ? signal_colors[color] : "#202733"
    "<circle cx=\"320\" cy=\"#{85 + index * 95}\" r=\"34\" fill=\"#{fill}\" stroke=\"#0f172a\" stroke-width=\"7\"/>"
  end.join
  body = "<rect x=\"255\" y=\"28\" width=\"130\" height=\"304\" rx=\"28\" fill=\"#111827\"/>#{lamps}"
  File.write(File.join(SIGNALS, "steady-#{active}.svg"), svg("Steady #{active} traffic signal", body))
end

%w[red yellow].each do |color|
  body = "<rect x=\"250\" y=\"95\" width=\"140\" height=\"170\" rx=\"28\" fill=\"#111827\"/><circle cx=\"320\" cy=\"180\" r=\"48\" fill=\"#{signal_colors[color]}\" stroke=\"#fff\" stroke-width=\"8\" stroke-dasharray=\"10 10\"/>"
  File.write(File.join(SIGNALS, "flashing-#{color}.svg"), svg("Flashing #{color} traffic signal", body))
end

arrows = { "red" => "#ef4444", "yellow" => "#facc15", "green" => "#22c55e", "flashing-yellow" => "#facc15" }
arrows.each do |name, color|
  dash = name == "flashing-yellow" ? ' stroke="#fff" stroke-width="7" stroke-dasharray="10 10"' : ""
  body = "<rect x=\"215\" y=\"105\" width=\"210\" height=\"150\" rx=\"28\" fill=\"#111827\"/><path d=\"M265 180l82-61v35h44v52h-44v35z\" fill=\"#{color}\"#{dash}/>"
  File.write(File.join(SIGNALS, "#{name}-arrow.svg"), svg("#{name.tr('-', ' ')} traffic arrow", body))
end

{
  "lane-red-x" => ['<path d="M250 110l140 140m0-140L250 250" stroke="#ef4444" stroke-width="32" stroke-linecap="round"/>', "Red X lane signal"],
  "lane-yellow-x" => ['<path d="M250 110l140 140m0-140L250 250" stroke="#facc15" stroke-width="32" stroke-linecap="round"/>', "Yellow X lane signal"],
  "lane-green-arrow" => ['<path d="M320 270V118m0 0-64 70m64-70 64 70" stroke="#22c55e" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>', "Green arrow lane signal"]
}.each do |name, (symbol, label)|
  body = "<rect x=\"190\" y=\"55\" width=\"260\" height=\"250\" rx=\"30\" fill=\"#111827\"/>#{symbol}"
  File.write(File.join(LANES, "#{name}.svg"), svg(label, body))
end

puts "Generated #{markings.length} marking, #{3 + 2 + arrows.length} traffic-signal, and 3 lane-signal SVGs."
