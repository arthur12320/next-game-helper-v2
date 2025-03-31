import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const StyledMarkdown: React.FC<{ content: string }> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ ...props }) => (
          <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />
        ),
        h2: ({ ...props }) => (
          <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />
        ),
        h3: ({ ...props }) => (
          <h3 className="text-xl font-bold mt-4 mb-2" {...props} />
        ),
        p: ({ ...props }) => <p className="mb-4" {...props} />,
        ul: ({ ...props }) => <ul className="list-disc pl-5 mb-4" {...props} />,
        ol: ({ ...props }) => (
          <ol className="list-decimal pl-5 mb-4" {...props} />
        ),
        li: ({ ...props }) => <li className="mb-1" {...props} />,
        a: ({ ...props }) => (
          <a className="text-blue-500 hover:underline" {...props} />
        ),
        blockquote: ({ ...props }) => (
          <blockquote
            className="border-l-4 border-gray-300 pl-4 italic my-4"
            {...props}
          />
        ),
        code: ({ ...props }) => (
          <code
            className="block bg-gray-100 rounded p-2 my-2 whitespace-pre-wrap text-black"
            {...props}
          />
        ),
        table: ({ ...props }) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full divide-y divide-gray-200" {...props} />
          </div>
        ),
        thead: ({ ...props }) => <thead className="bg-gray-50" {...props} />,
        th: ({ ...props }) => (
          <th
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            {...props}
          />
        ),
        td: ({ ...props }) => (
          <td className="px-6 py-4 whitespace-nowrap" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default StyledMarkdown;
