using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediFlow.Migrations
{
    /// <inheritdoc />
    public partial class Add_InvoiceId_To_Returns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_AppReturns_InvoiceId",
                table: "AppReturns",
                column: "InvoiceId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppReturns_AppInvoices_InvoiceId",
                table: "AppReturns",
                column: "InvoiceId",
                principalTable: "AppInvoices",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppReturns_AppInvoices_InvoiceId",
                table: "AppReturns");

            migrationBuilder.DropIndex(
                name: "IX_AppReturns_InvoiceId",
                table: "AppReturns");
        }
    }
}
