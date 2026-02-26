import React from 'react'

/**
 * Very lightweight markdown-to-React renderer for AI-generated content.
 * Handles: ## headings, **bold**, *italic*, - lists, 1. ordered lists,
 * `code`, > blockquotes, --- dividers, and plain paragraphs.
 */
export function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: React.ReactNode[] = []
  let listType: 'ul' | 'ol' | null = null
  let key = 0

  const nextKey = () => (key++).toString()

  function inlineFormat(line: string): React.ReactNode {
    // Process inline bold, italic, and code
    const parts: React.ReactNode[] = []
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g
    let lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index))
      }
      if (match[0].startsWith('**')) {
        parts.push(<strong key={nextKey()}>{match[2]}</strong>)
      } else if (match[0].startsWith('*')) {
        parts.push(<em key={nextKey()}>{match[3]}</em>)
      } else if (match[0].startsWith('`')) {
        parts.push(<code key={nextKey()}>{match[4]}</code>)
      }
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex))
    }
    return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : <>{parts}</>
  }

  function flushList() {
    if (listItems.length === 0) return
    if (listType === 'ul') {
      elements.push(<ul key={nextKey()}>{listItems}</ul>)
    } else {
      elements.push(<ol key={nextKey()}>{listItems}</ol>)
    }
    listItems = []
    listType = null
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed === '' || trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushList()
      if (trimmed.match(/^[-*_]{3}$/)) {
        elements.push(<hr key={nextKey()} />)
      }
      continue
    }

    if (trimmed.startsWith('### ')) {
      flushList()
      elements.push(<h3 key={nextKey()}>{inlineFormat(trimmed.slice(4))}</h3>)
    } else if (trimmed.startsWith('## ')) {
      flushList()
      elements.push(<h2 key={nextKey()}>{inlineFormat(trimmed.slice(3))}</h2>)
    } else if (trimmed.startsWith('# ')) {
      flushList()
      elements.push(<h1 key={nextKey()}>{inlineFormat(trimmed.slice(2))}</h1>)
    } else if (trimmed.startsWith('> ')) {
      flushList()
      elements.push(<blockquote key={nextKey()}>{inlineFormat(trimmed.slice(2))}</blockquote>)
    } else if (trimmed.match(/^[-*] /)) {
      if (listType !== 'ul') { flushList(); listType = 'ul' }
      listItems.push(<li key={nextKey()}>{inlineFormat(trimmed.slice(2))}</li>)
    } else if (trimmed.match(/^\d+\. /)) {
      if (listType !== 'ol') { flushList(); listType = 'ol' }
      listItems.push(<li key={nextKey()}>{inlineFormat(trimmed.replace(/^\d+\. /, ''))}</li>)
    } else {
      flushList()
      elements.push(<p key={nextKey()}>{inlineFormat(trimmed)}</p>)
    }
  }

  flushList()
  return <>{elements}</>
}
