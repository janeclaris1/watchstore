import Markdown from "markdown-to-jsx";

export function BlogMarkdown({ content }: { content: string }) {
  return (
    <Markdown
      options={{
        forceBlock: true,
        overrides: {
          h1: {
            props: {
              className: "font-playfair text-3xl text-wf-black mt-10 mb-4",
            },
          },
          h2: {
            props: {
              className: "font-playfair text-2xl text-wf-black mt-10 mb-4",
            },
          },
          h3: {
            props: {
              className: "font-playfair text-xl text-wf-black mt-8 mb-3",
            },
          },
          p: {
            props: {
              className: "text-wf-gray leading-relaxed text-[15px] mb-4",
            },
          },
          ul: {
            props: {
              className: "list-disc pl-5 space-y-2 text-wf-gray mb-4 text-[15px]",
            },
          },
          ol: {
            props: {
              className:
                "list-decimal pl-5 space-y-2 text-wf-gray mb-4 text-[15px]",
            },
          },
          li: { props: { className: "leading-relaxed" } },
          a: {
            props: {
              className: "text-gold hover:text-gold-light underline-offset-2",
            },
          },
          strong: { props: { className: "text-wf-black font-semibold" } },
          blockquote: {
            props: {
              className:
                "border-l-2 border-gold pl-4 italic text-wf-gray my-6",
            },
          },
          img: {
            props: {
              className: "rounded-lg my-8 w-full object-cover max-h-[480px]",
            },
          },
          hr: { props: { className: "border-wf-border my-10" } },
        },
      }}
    >
      {content}
    </Markdown>
  );
}
