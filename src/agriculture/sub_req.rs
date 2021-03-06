use super::*;
use crate::{
    networking::*,
    terrain::components::{TileID, RegionID},
};
pub use super::components::AgrData;
use std::sync::mpsc::Receiver;
use std::collections::HashSet;
use specs::prelude::*;

pub struct AgrSender {
    pub out: ClientSender
}

pub struct Agr;

impl<'a> System<'a> for AgrSender {
    type SystemData = (Read<'a, HashSet<AgrData>>,
                       ReadStorage<'a, BaseFarmData>,
                       ReadStorage<'a, FarmData>,
                       ReadStorage<'a, FoodStock>,
                       ReadStorage<'a, TileID>);

    fn run(&mut self, (subs, base_farm_data, farm_data, food_stock, tile_id): Self::SystemData) {
        let out = &self.out;
        for &sub in subs.iter() {
            let section = Sections::Agr;

            match sub {
                AgrData::FarmData => {
                    info!("Processing FarmData in AgrSubReq");
                    out.sub_push(SubPush {
                        section,
                        component: "FarmData",
                        data: (&tile_id, &farm_data).join().collect::<Vec<_>>(),
                        keys: None,
                    });
                }
                AgrData::BaseFarmData => {
                    // doesn't have to be sorted now
                    let mut data = (&tile_id, &base_farm_data).join()
                        .collect::<Vec<_>>();
                    data.sort_by_key(|(&x, _)| x.clone());

                    out.sub_push(SubPush {
                        section,
                        component: "BaseFarmData",
                        data,
                        keys: None,
                    })
                }
                AgrData::FoodStock => {
                    out.sub_push(SubPush {
                        section,
                        component: "FoodStock",
                        data: (&tile_id, &food_stock).join().collect::<Vec<_>>(),
                        keys: None,
                    })
                }
            };
        }
    }
}


