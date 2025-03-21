"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"
import { cn } from "@/lib/utils"

export interface Option {
  value: string
  label: string
  disabled?: boolean
}

interface MultiSelectProps {
  options: Option[]
  value: Option[]
  onChange: (options: Option[]) => void
  placeholder?: string
  className?: string
  badgeClassName?: string
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options",
  className,
  badgeClassName,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleSelect = React.useCallback(
    (option: Option) => {
      const isSelected = value.some((item) => item.value === option.value)
      
      if (isSelected) {
        onChange(value.filter((item) => item.value !== option.value))
      } else {
        onChange([...value, option])
      }
      
      setInputValue("")
    },
    [value, onChange]
  )

  const handleRemove = React.useCallback(
    (option: Option) => {
      onChange(value.filter((item) => item.value !== option.value))
    },
    [onChange, value]
  )

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Backspace" && !inputValue && value.length > 0) {
        handleRemove(value[value.length - 1])
      }
    },
    [handleRemove, inputValue, value]
  )

  return (
    <Command
      onKeyDown={handleKeyDown}
      className={cn(
        "overflow-visible bg-transparent",
        className
      )}
    >
      <div className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex gap-1 flex-wrap">
          {value.map((option) => (
            <Badge
              key={option.value}
              variant="secondary"
              className={cn(
                "flex items-center gap-1 rounded py-1 px-2",
                badgeClassName
              )}
            >
              {option.label}
              <button
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRemove(option)
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onClick={() => handleRemove(option)}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={value.length === 0 ? placeholder : undefined}
            className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && options.length > 0 && (
          <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandGroup className="h-full overflow-auto max-h-[200px]">
              {options
                .filter((option) => 
                  option.label.toLowerCase().includes(inputValue.toLowerCase()))
                .map((option) => {
                  const isSelected = value.some(
                    (item) => item.value === option.value
                  )
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => handleSelect(option)}
                      className={cn(
                        "flex cursor-default items-center gap-2 py-2 pl-8 pr-2 relative aria-selected:bg-accent aria-selected:text-accent-foreground",
                        option.disabled && "cursor-not-allowed opacity-50",
                        isSelected && "bg-accent text-accent-foreground"
                      )}
                      disabled={option.disabled}
                    >
                      <span
                        className={cn(
                          "absolute left-2 flex h-3.5 w-3.5 items-center justify-center rounded-sm border border-primary/70",
                          isSelected && "bg-primary text-primary-foreground"
                        )}
                      >
                        <span className={cn("h-2 w-2 bg-none rounded-sm", isSelected && "bg-current")} />
                      </span>
                      {option.label}
                    </CommandItem>
                  )
                })}
            </CommandGroup>
          </div>
        )}
      </div>
    </Command>
  )
} 