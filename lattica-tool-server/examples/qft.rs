// examples/qft.rs
fn main() {
    println!("QFT demo placeholder: compute small example.");
    // small deterministic loop so it produces output
    let mut s = 0u64;
    for i in 0..1000 {
        s = s.wrapping_add((i as u64).wrapping_mul(17));
    }
    println!("checksum: {}", s);
}