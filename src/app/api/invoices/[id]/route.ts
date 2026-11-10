import { NextRequest, NextResponse } from "next/server";
import { InvoiceService } from "@/services/invoice.service";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const url = new URL(req.url);
    const layout = url.searchParams.get("layout") || "A4_STANDARD";
    const lang = url.searchParams.get("lang") || "bilingual";
    const recordPrint = url.searchParams.get("print") === "true";

    const orderIds = id.split(",").filter(Boolean);
    const data = await InvoiceService.getAuthorizedInvoiceData(orderIds, recordPrint);

    return NextResponse.json({
      success: true,
      layout,
      lang,
      ...data,
    });
  } catch (error: any) {
    const status = error.message?.startsWith("UNAUTHORIZED")
      ? 401
      : error.message?.startsWith("FORBIDDEN")
      ? 403
      : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
