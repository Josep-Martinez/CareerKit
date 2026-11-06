import { useState } from 'react'
import { PageHeading } from '../components/PagePrimitives.jsx'
import { TextField } from '../components/FormPrimitives.jsx'
import { STRINGS as s } from '../../i18n/es.js'

export function PromptInboxPage({ pending, onCopy }) {
  const copy = s.promptInbox
  const [vacancyReference, setVacancyReference] = useState('')
  const [copyMessages, setCopyMessages] = useState({})

  async function copyPrompt(prompt) {
    if (prompt.requiresVacancy && !vacancyReference.trim()) {
      setCopyMessages((previous) => ({ ...previous, [prompt.id]: copy.copyMissingVacancy }))
      return
    }
    const text = prompt.text.replace('{{vacancy}}', vacancyReference.trim())
    try {
      await navigator.clipboard.writeText(text)
      onCopy(prompt.id)
      setCopyMessages((previous) => ({ ...previous, [prompt.id]: copy.copied }))
    } catch {
      setCopyMessages((previous) => ({ ...previous, [prompt.id]: copy.copyFailed }))
    }
  }

  return <>
    <PageHeading eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle}/>
    <section className="prompt-usage-card"><div className="prompt-usage-mark" aria-hidden="true">i</div><div><h2>{copy.usageTitle}</h2><p>{copy.usageBody}</p><p>{copy.noNetwork}</p></div></section>
    {pending && <section className="prompt-reminder" role="status"><span className="prompt-reminder-count">1</span><div><h2>{copy.pendingTitle}</h2><p>{copy.pendingBody}</p></div></section>}
    <div className="prompt-list">{copy.prompts.map((prompt) => {
      const isPending = pending && prompt.id === 'refresh-cv'
      const renderedText = prompt.text.replace('{{vacancy}}', vacancyReference.trim() || copy.vacancyPromptPlaceholder)
      return <article className={`prompt-card ${isPending ? 'is-pending' : ''}`} key={prompt.id}>
        <div className="prompt-card-heading"><div><h2>{prompt.title}</h2><p className="prompt-use">{prompt.use}</p></div>{isPending && <span className="prompt-pending-tag">{copy.pendingTag}</span>}</div>
        {prompt.requiresVacancy && <TextField label={copy.vacancyReference} value={vacancyReference} onChange={(value) => { setVacancyReference(value); setCopyMessages((previous) => ({ ...previous, [prompt.id]: '' })) }} hint={copy.vacancyReferenceHint}/>}
        <textarea className="prompt-content" aria-label={`${copy.promptLabel}: ${prompt.title}`} readOnly rows={6} value={renderedText} onFocus={(event) => event.target.select()}/>
        <div className="prompt-card-footer"><button className="button secondary small" disabled={prompt.requiresVacancy && !vacancyReference.trim()} onClick={() => copyPrompt(prompt)}>{copy.copyButton}</button>{copyMessages[prompt.id] && <span role="status">{copyMessages[prompt.id]}</span>}{isPending && copyMessages[prompt.id] === copy.copyFailed && <button className="text-button" onClick={() => { onCopy(prompt.id); setCopyMessages((previous) => ({ ...previous, [prompt.id]: copy.copied })) }}>{copy.confirmManualCopy}</button>}</div>
      </article>
    })}</div>
  </>
}
