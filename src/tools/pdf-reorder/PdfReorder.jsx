import { ArrowDownUp } from "lucide-react";
import { ToolLayout } from "../../components/layout/ToolLayout.jsx";
import { PageOrganizer } from "../../components/pdf/PageOrganizer.jsx";
import { PdfSourceBar, PdfUpload } from "../../components/pdf/PdfUpload.jsx";
import { getToolById } from "../../data/tools.js";
import { usePdfFile } from "../../hooks/usePdfFile.js";

const tool = getToolById("pdf-reorder");

export default function PdfReorder() {
  const source = usePdfFile();
  return (
    <ToolLayout tool={tool}>
      {source.status !== "ready" ? (
        <PdfUpload source={source} />
      ) : (
        <div className="flex flex-col gap-6">
          <PdfSourceBar source={source} />
          <PageOrganizer key={source.id} source={source} actionLabel="Save new order" actionIcon={ArrowDownUp} outputSuffix="-reordered" />
        </div>
      )}
    </ToolLayout>
  );
}
