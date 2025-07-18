module pattern_matcher (
    input logic clk,
    input logic rst,
    input logic [7:0] region,
    input logic [7:0] auth_level,
    input logic [7:0] expiry,
    input logic [7:0] signature_id,
    output logic match
);

    // Authorized Pattern (Hardcoded for now)
    logic [7:0] valid_region     = 8'h0A;
    logic [7:0] valid_auth_level = 8'h01;
    logic [7:0] valid_expiry     = 8'h10;
    logic [7:0] valid_signature  = 8'hF3;

    always_ff @(posedge clk or posedge rst) begin
        if (rst) begin
            match <= 0;
        end else begin
            if ((region == valid_region) &&
                (auth_level == valid_auth_level) &&
                (expiry == valid_expiry) &&
                (signature_id == valid_signature)) begin
                match <= 1;
            end else begin
                match <= 0;
            end
        end
    end

endmodule
