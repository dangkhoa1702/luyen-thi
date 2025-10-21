import React from 'react';

interface SimpleMarkdownProps {
  content: string;
}

// A very basic markdown-to-HTML converter.
// NOTE: This is NOT a full or secure markdown parser.
// It's for demonstration purposes only.
const simpleMarkdownParse = (text: string) => {
    let html = text
        // Bold **text**
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic *text*
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Headers ### text
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        // Headers ## text
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        // Headers # text
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // List items * or -
        .replace(/^\s*[\-\*] (.*$)/gim, '<li>$1</li>')
        // Newlines to <br>
        .replace(/\n/g, '<br />')
        // Correcting list items with breaks
        .replace(/<\/li><br \/>/g, '</li>');

    // Wrap list items in <ul>
    const listRegex = /(<li>.*<\/li>)/gs;
    if (listRegex.test(html)) {
      html = html.replace(listRegex, '<ul>$1</ul>');
    }

    return html;
};

export const SimpleMarkdown: React.FC<SimpleMarkdownProps> = ({ content }) => {
    const htmlContent = simpleMarkdownParse(content);
    // WARNING: In a production app, always sanitize HTML that comes from external sources to prevent XSS attacks.
    return <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};
