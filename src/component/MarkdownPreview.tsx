import { Script } from 'node:vm'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  generateHtml,
  generateHtmlOptionType,
  generateHtmlType,
} from '../generator/generator'

export const MarkdownPreview: React.FC<Props> = (props) => {
  useEffect(() => {
    const generateHtmlOption: generateHtmlOptionType = {
      marginTop: 10,
      marginRightLeft: 10,
      marginBottom: 10,
      contents: [],
    }
    const html = generateHtml(props.md, generateHtmlOption)
    setPreviewHtml(html)
  }, [props.md])
  const divRef = useRef()

  const [previewHtml, setPreviewHtml] = useState('')
  return (
    <div className="Preview">
      <div dangerouslySetInnerHTML={{ __html: previewHtml }}></div>
    </div>
  )
}
type Props = {
  md: string
}
