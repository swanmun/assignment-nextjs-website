import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FileItem, FILE_ITEM_STATUSES, type FileItemProps } from "@/components/file-uploader/FileItem";
import { FileUploader } from "@/components/file-uploader/FileUploader";
import { Block, ComponentPage, Matrix, kit } from "../kit";

const meta = {
  title: "Components/Form/FileUploader",
  component: FileUploader,
  subcomponents: { FileItem },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof FileUploader>;

export default meta;
type Story = StoryObj<typeof meta>;

const HINT = "JPG · PNG, 1장당 10MB · 최대 5장";
const THUMB = "/images/thumb-8.png";

const ITEMS: Record<(typeof FILE_ITEM_STATUSES)[number], FileItemProps> = {
  uploading: { name: "IMG_2051.jpg", meta: "3.1MB · 업로드 중 64%", status: "uploading", progress: 64, thumbnailUrl: THUMB },
  complete: { name: "IMG_2040.jpg", meta: "2.4MB · 업로드 완료", status: "complete", thumbnailUrl: THUMB },
  error: { name: "IMG_2041.jpg", meta: "12.4MB · 용량 초과", status: "error", thumbnailUrl: THUMB },
};

const noop = () => {};

const Interactive = () => {
  const [files, setFiles] = useState<FileItemProps[]>([ITEMS.complete]);
  const tooBig = files.some((file) => file.status === "error");
  return (
    <FileUploader
      hint={HINT}
      accept="image/png,image/jpeg"
      error={tooBig ? "올리지 못한 파일이 있어요" : undefined}
      onFilesSelected={(selected) =>
        setFiles((prev) => [
          ...prev,
          ...selected.map((file) => {
            const mb = file.size / 1024 / 1024;
            const ok = mb <= 10;
            return {
              name: file.name,
              meta: `${mb.toFixed(1)}MB · ${ok ? "업로드 완료" : "용량 초과"}`,
              status: ok ? ("complete" as const) : ("error" as const),
              thumbnailUrl: URL.createObjectURL(file),
            };
          }),
        ])
      }
    >
      {files.map((file, index) => (
        <FileItem key={`${file.name}-${index}`} {...file} onRemove={() => setFiles((prev) => prev.filter((_, i) => i !== index))} />
      ))}
    </FileUploader>
  );
};

export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="File Uploader"
      description="드롭존 + 파일선택버튼 결합 단일형. 상단 헬퍼텍스트(label-md)로 형식·용량을 안내하고, 드롭존 안내문구는 body-md, 파일선택버튼은 secondary sm입니다. 하단에 썸네일·상태·삭제 버튼이 있는 파일 아이템을 나열합니다."
    >
      <Block title="Dropzone" usage="default · dragover · disabled · error">
        <Matrix
          rowHeader=""
          align="start"
          columns={["default", "dragover", "disabled", "error"]}
          rows={[
            {
              label: "드롭존",
              cells: [
                <FileUploader key="d" hint={HINT}>
                  <FileItem {...ITEMS.complete} onRemove={noop} />
                  <FileItem {...ITEMS.uploading} onRemove={noop} />
                </FileUploader>,
                <FileUploader key="o" hint={HINT} defaultDragOver>
                  <FileItem {...ITEMS.complete} onRemove={noop} />
                </FileUploader>,
                <FileUploader key="x" hint={HINT} disabled>
                  <FileItem {...ITEMS.complete} onRemove={noop} removeDisabled />
                  <FileItem {...ITEMS.complete} name="IMG_2039.jpg" onRemove={noop} removeDisabled />
                </FileUploader>,
                <FileUploader key="e" hint={HINT} error="올리지 못한 파일이 있어요">
                  <FileItem {...ITEMS.error} onRemove={noop} />
                  <FileItem {...ITEMS.complete} onRemove={noop} />
                </FileUploader>,
              ],
            },
          ]}
        />
      </Block>
      <Block title="File Item" usage="uploading: 스피너 + 진행 막대 · complete: 체크 아이콘 · error: 에러 아이콘">
        <Matrix
          rowHeader=""
          columns={[...FILE_ITEM_STATUSES]}
          rows={[
            {
              label: "파일 아이템",
              cells: FILE_ITEM_STATUSES.map((status) => (
                <ul key={status} style={{ width: "100%", padding: 0, listStyle: "none" }}>
                  <FileItem {...ITEMS[status]} onRemove={noop} />
                </ul>
              )),
            },
          ]}
        />
      </Block>
      <Block title="Interactive" usage="실제 파일을 끌어다 놓거나 선택해 보세요. 10MB를 넘으면 에러 아이템이 됩니다.">
        <div style={{ maxWidth: 360 }}>
          <Interactive />
        </div>
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { hint: HINT, disabled: false },
  render: (args) => (
    <FileUploader {...args}>
      <FileItem {...ITEMS.complete} onRemove={noop} />
      <FileItem {...ITEMS.uploading} onRemove={noop} />
    </FileUploader>
  ),
  decorators: [(Story) => <div className={kit.padded} style={{ maxWidth: 400 }}>{Story()}</div>],
};
