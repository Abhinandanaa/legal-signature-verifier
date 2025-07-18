module verifier_top (
    input logic clk,
    input logic rst,
    input logic [31:0] signature_in,
    output logic match
);

    // Internal signals to hold decoded fields
    logic [7:0] region;
    logic [7:0] auth_level;
    logic [7:0] expiry;
    logic [7:0] signature_id;

    // Extract fields from input
    always_ff @(posedge clk or posedge rst) begin
        if (rst) begin
            region       <= 8'd0;
            auth_level   <= 8'd0;
            expiry       <= 8'd0;
            signature_id <= 8'd0;
        end else begin
            region       <= signature_in[31:24];
            auth_level   <= signature_in[23:16];
            expiry       <= signature_in[15:8];
            signature_id <= signature_in[7:0];
        end
    end

    // Instantiate the pattern matcher module
    pattern_matcher matcher_inst (
        .clk(clk),
        .rst(rst),
        .region(region),
        .auth_level(auth_level),
        .expiry(expiry),
        .signature_id(signature_id),
        .match(match)
    );

endmodule
