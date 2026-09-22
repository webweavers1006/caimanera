-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "oficina_id" INTEGER;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_oficina_id_fkey" FOREIGN KEY ("oficina_id") REFERENCES "oficinas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
