require("lualibs.lua")

function getJsonFromFile(file)
  local fileHandle = io.open(file)
  local jsonString = fileHandle:read('*a')
  fileHandle:close()  -- Use ':' instead of '.'
  local jsonData = utilities.json.tolua(jsonString)
  return jsonData
end

function printEduItems(file)
  local json = getJsonFromFile(file)
  for key, value in pairs(json) do
    tex.print("\\resumeEduEntry")
    tex.print("{" .. value["school"] .. "}")
    tex.print("{" .. value["school_location"] .. "}")
    tex.print("{" .. value["degree"] .. "}")
    tex.print("{" .. value["time_period"] .. "}")
  end
end

function printExpItems(file)
  local json = getJsonFromFile(file)
  
  for _, value in ipairs(json) do
    tex.print("\\begin{small}")  -- Use \begin{footnotesize} if you want a smaller size
    tex.print("\\resumeSubHeadingListStart")
    tex.print("\\resumeExpEntry")
    tex.print("{" .. value["company"] .. "}")
    tex.print("{" .. value["company_location"] .. "}")
    tex.print("{" .. value["role"] .. "}")
    tex.print("{" .. value["stack"] .. "}")
    tex.print("{" .. value["time_duration"] .. "}")

    tex.print("\\resumeItemListStart")
    for _, detail in ipairs(value["details"]) do
      tex.print("\\item{" .. detail["title"] .. " \\hfill \\textit{" .. detail["languages"] .. "}}")

      -- Check if "scale" field exists before concatenating
      if detail["scale"] then
        tex.print("\\newline \\textbf{ Scale:- }  " .. detail["scale"] .. " \\hfill")
      end
      -- Print descriptions with sub-bullets
      tex.print("\\begin{itemize}")
      for _, description in ipairs(detail["descriptions"]) do
        tex.print("\\item " .. description)
        tex.print("\\vspace{2pt}")
      end
      tex.print("\\end{itemize}")
    end
    tex.print("\\resumeItemListEnd")
    tex.print("\\vspace{-1pt}")
    tex.print("\\resumeSubHeadingListEnd")
    tex.print("\\end{small}")  -- Use \end{footnotesize} if you want to revert to the original size
  end
end

function printProjItems(file)
  local json = getJsonFromFile(file)

  for _, value in ipairs(json) do
    tex.print("\\begin{small}")  -- Use \begin{footnotesize} if you want a smaller size
    tex.print("\\resumeSubHeadingListStart")
    tex.print("\\resumeProjectHeading")

    -- Construct the project heading with the title first
    local projectHeading = "{" .. value["title"]

    -- Add optional site/repository link and icon after the title
    if value["site"] then
      projectHeading = projectHeading .. " $|$ \\href{" .. value["site"] .. "}{\\faGlobe}"
    elseif value["repository"] then
      projectHeading = projectHeading .. " $|$ \\href{" .. value["repository"] .. "}{\\faGithub}"
    end

    projectHeading = projectHeading .. " $|$ \\emph{  \\textbf {Stack:- } " .. value["languages"] .. " }}"

    tex.print(projectHeading)
    tex.print("{" .. value["time_period"] .. "}")

    tex.print("\\begin{itemize}")
    for _, description in ipairs(value["descriptions"]) do
      tex.print("\\item " .. description)
      tex.print("\\vspace{-5pt}")
    end
    tex.print("\\end{itemize}")

    tex.print("\\vspace{-3pt}")  -- Adjust the space as needed
    tex.print("\\resumeSubHeadingListEnd")
    tex.print("\\end{small}")  -- Use \end{footnotesize} if you want to revert to the original size
  end  
end

function printProdItems(file)
  local json = getJsonFromFile(file)
  
  for _, value in ipairs(json) do
    tex.print("\\begin{small}")
    tex.print("\\resumeSubHeadingListStart")
    tex.print("\\resumeExpEntry")
    
    -- Use company (product name)
    tex.print("{" .. value["company"] .. "}")
    
    -- Add link as "location" with icon
    local location = ""
    if value["site"] then
      location = "\\href{" .. value["site"] .. "}{\\faGlobe}"
    elseif value["repository"] then
      location = "\\href{" .. value["repository"] .. "}{\\faGithub}"
    end
    tex.print("{" .. location .. "}")
    
    -- Role
    tex.print("{" .. value["role"] .. "}")
    
    -- Stack (pass empty string if not present to avoid nil error)
    local stack = value["stack"] or ""
    tex.print("{" .. stack .. "}")
    
    -- Time duration
    tex.print("{" .. value["time_duration"] .. "}")

    tex.print("\\resumeItemListStart")
    
    -- Print details (similar to experience)
    for _, detail in ipairs(value["details"]) do
      tex.print("\\item{" .. detail["title"] .. " \\hfill \\textit{" .. detail["languages"] .. "}}")

      -- Check if "scale" field exists
      if detail["scale"] then
        tex.print("\\newline \\textbf{ Scale:- }  " .. detail["scale"] .. " \\hfill")
      end
      
      -- Print descriptions with sub-bullets
      tex.print("\\begin{itemize}")
      for _, description in ipairs(detail["descriptions"]) do
        tex.print("\\item " .. description)
        tex.print("\\vspace{2pt}")
      end
      tex.print("\\end{itemize}")
    end
    
    tex.print("\\resumeItemListEnd")
    tex.print("\\vspace{-1pt}")
    tex.print("\\resumeSubHeadingListEnd")
    tex.print("\\end{small}")
  end
end




function printHeading(file, index)
  
  local json = getJsonFromFile(file)
  local value = json[index]
  tex.print("\\begin{center}")
  tex.print("\\textbf{\\Huge \\scshape " .. value["name"] .. "}")
  tex.print("\\href{" .. value["website"] .. "/}{\\textbf{\\small\\faLink}} \\\\")
  tex.print( value["phone"] .." $|$ \\href{mailto:" .. value["email"] .. "}{".. value["email"] .."} $|$ \\href{" .. value["linkedin"] .. "}{\\faLinkedin} $|$ \\href{" .. value["github"] .. "}{\\faGithub}")
  tex.print("\\end{center}")
  tex.print("\\vspace{-25pt}")
end




function printSkills(file, index)
  local json = getJsonFromFile(file)
  local skills = json[index]["skills"]
  
  for _, skill in ipairs(skills) do
    tex.print("\\textbf{" .. skill["title"] .. "} | \\emph{" .. skill["details"] .. "}\\\\")
    tex.print("\\vspace{2pt}")  -- Add spacing between skill categories
  end
end






