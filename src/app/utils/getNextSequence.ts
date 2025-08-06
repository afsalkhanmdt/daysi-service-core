import AutoIncrementCounter from "@/models/counter";

export async function getNextSequence(fieldName: string): Promise<number> {
  const updated = await AutoIncrementCounter.findOneAndUpdate(
    { fieldName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return updated.seq;
}
